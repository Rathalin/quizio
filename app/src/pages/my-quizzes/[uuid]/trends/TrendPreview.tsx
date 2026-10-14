import { PlayProtocolStatistic } from '@/api-client';
import { useDateFormatter } from '@/utilities/useDateFormatter';
import { useTheme } from '@mui/material/styles';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { AreaChart, Area, CartesianGrid, YAxis, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { IntervalFilterOption } from './index.page';

type DataKey = keyof PlayProtocolStatistic['entriesPerDay'][number];
type DataLabel = Exclude<DataKey, 'playedAt'>;

type Props = {
  quizUuid: string;
  statistic: PlayProtocolStatistic;
  intervalFilter: IntervalFilterOption;
};

export function TrendPreview({ quizUuid, statistic, intervalFilter }: Props) {
  const theme = useTheme();
  const t = useTranslations('myQuizzesTrends.graph');
  const { locale } = useRouter();
  const dateFormatter = useDateFormatter();

  const monthYearFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale === 'de' ? 'de-AT' : 'en-GB', { month: 'short', year: 'numeric' }),
    [locale],
  );

  const yearFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale === 'de' ? 'de-AT' : 'en-GB', { year: 'numeric' }),
    [locale],
  );

  function roundUpToNextMultipleOfFive(n: number): number {
    if (n <= 0) {
      return 5;
    }
    return Math.ceil(n / 5) * 5;
  }

  const yMax = useMemo(
    () =>
      roundUpToNextMultipleOfFive(
        Math.max(
          ...statistic.entriesPerDay.map((entry) => Math.max(entry.playCount ?? 0, entry.migratedPlayCount ?? 0)),
        ),
      ),
    [statistic],
  );

  const ticks = useMemo<string[]>(() => {
    const dates = statistic.entriesPerDay.map((d) => d.playedAt);
    if (intervalFilter === 'lastWeek' || intervalFilter === 'lastMonth') {
      return dates;
    }
    if (intervalFilter === 'lastYear') {
      return dates.filter((dateStr) => new Date(dateStr).getDate() === 1);
    }
    // allTime:
    const count = dates.length;
    if (count <= 31) {
      return dates;
    }
    if (count <= 180) {
      const filtered = dates.filter((dateStr) => {
        const day = new Date(dateStr).getDate();
        return day === 1 || day === 15;
      });
      return filtered.length >= 2 ? filtered : dates;
    }
    if (count <= 366) {
      const filtered = dates.filter((dateStr) => new Date(dateStr).getDate() === 1);
      return filtered.length >= 2 ? filtered : dates;
    }
    if (count <= 730) {
      // Every 3 months (quarterly)
      const filtered = dates.filter((dateStr) => {
        const d = new Date(dateStr);
        return d.getDate() === 1 && d.getMonth() % 3 === 0;
      });
      return filtered.length >= 2 ? filtered : dates.filter((dateStr) => new Date(dateStr).getDate() === 1);
    }
    if (count <= 1460) {
      // Jan 1 and Jul 1
      const filtered = dates.filter((dateStr) => {
        const d = new Date(dateStr);
        return d.getDate() === 1 && (d.getMonth() === 0 || d.getMonth() === 6);
      });
      return filtered.length >= 2 ? filtered : dates.filter((dateStr) => new Date(dateStr).getDate() === 1);
    }
    // More than 4 years: Jan 1 of each year
    const filtered = dates.filter((dateStr) => {
      const d = new Date(dateStr);
      return d.getDate() === 1 && d.getMonth() === 0;
    });
    return filtered.length >= 2 ? filtered : dates.filter((dateStr) => new Date(dateStr).getDate() === 1);
  }, [intervalFilter, statistic.entriesPerDay]);

  const tickFormatter = useMemo(() => {
    if (intervalFilter === 'lastYear') {
      return (dateStr: string) => monthYearFormatter.format(new Date(dateStr));
    }
    if (intervalFilter === 'allTime') {
      if (statistic.entriesPerDay.length <= 31) {
        return (dateStr: string) => dateFormatter.format(new Date(dateStr));
      }
      if (statistic.entriesPerDay.length > 1460) {
        return (dateStr: string) => yearFormatter.format(new Date(dateStr));
      }
      return (dateStr: string) => monthYearFormatter.format(new Date(dateStr));
    }
    return (dateStr: string) => dateFormatter.format(new Date(dateStr));
  }, [dateFormatter, intervalFilter, monthYearFormatter, yearFormatter, statistic.entriesPerDay.length]);

  return (
    <ResponsiveContainer height={400}>
      <AreaChart key={`${quizUuid}-${intervalFilter}`} data={statistic.entriesPerDay} margin={{ top: 20, right: 60, left: -30, bottom: 50 }}>
        <defs>
          <linearGradient id="colorPlays" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={theme.vars?.palette.secondary.main} stopOpacity={0.8} />
            <stop offset="95%" stopColor={theme.vars?.palette.secondary.dark} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorMigratedPlays" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={theme.vars?.palette.secondary.main} stopOpacity={0.2} />
            <stop offset="95%" stopColor={theme.vars?.palette.secondary.dark} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeOpacity={0.2} />
        <XAxis
          dataKey={'playedAt' satisfies DataKey}
          ticks={ticks}
          tickFormatter={tickFormatter}
          angle={45}
          textAnchor="start"
        />
        <YAxis dataKey={'playCount' satisfies DataKey} domain={[0, yMax]} />
        <Area
          type="monotone"
          dataKey={'playCount' satisfies DataKey}
          stroke={theme.vars?.palette.secondary.light}
          fill="url(#colorPlays)"
        />
        <Area
          type="monotone"
          dataKey={'migratedPlayCount' satisfies DataKey}
          stroke={theme.vars?.palette.secondary.light}
          fill="url(#colorMigratedPlays)"
          strokeDasharray="4"
        />
        <Tooltip
          labelFormatter={(label) => {
            if (!label) return '';
            return dateFormatter.format(new Date(label as string | number));
          }}
          formatter={(value, name) => [
            t('dataKey.times', { count: value as number }),
            name === 'migratedPlayCount' ? t('dataKey.migratedPlays') : t('dataKey.plays'),
          ]}
          contentStyle={{
            backgroundColor: theme.vars?.palette.background.paper,
            borderColor: theme.vars?.palette.secondary.main,
            borderRadius: theme.vars?.shape.borderRadius,
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

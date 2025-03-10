import { PlayProtocolStatistic } from '@/api-client';
import { useDateFormatter } from '@/utilities/useDateFormatter';
import { useTheme } from '@mui/material/styles';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { AreaChart, Area, CartesianGrid, YAxis, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

type DataKey = keyof PlayProtocolStatistic['entriesPerDay'][number];
type DataLabel = Exclude<DataKey, 'playedAt'>;

type Props = {
  quizUuid: string;
  statistic: PlayProtocolStatistic;
};

export function TrendPreview({ quizUuid, statistic }: Props) {
  const theme = useTheme();
  const t = useTranslations('myQuizzesTrends.graph');
  const { locale } = useRouter();
  const dateFormatter = useDateFormatter();

  const monthYearFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale === 'de' ? 'de-AT' : 'en-GB', { month: 'short', year: 'numeric' }),
    [locale]
  );

  function roundUpToNextMultipleOfFive(n: number): number {
    if (n <= 0) {
      return 5;
    }
    return Math.ceil(n / 5) * 5;
  }

  const yMax = useMemo(
    () => roundUpToNextMultipleOfFive(Math.max(...statistic.entriesPerDay.map((entry) => entry.playCount ?? 0))),
    [statistic]
  );

  return (
    <ResponsiveContainer height={340}>
      <AreaChart key={quizUuid} data={statistic.entriesPerDay} margin={{ top: 20, right: 60, left: -30, bottom: 40 }}>
        <defs>
          <linearGradient id="colorPlays" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={theme.palette.secondary.main} stopOpacity={0.8} />
            <stop offset="95%" stopColor={theme.palette.secondary.dark} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorMigratedPlays" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={theme.palette.secondary.main} stopOpacity={0.2} />
            <stop offset="95%" stopColor={theme.palette.secondary.dark} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeOpacity={0.2} />
        <XAxis
          dataKey={'playedAt' satisfies DataKey}
          ticks={statistic.entriesPerDay.map((d) => d.playedAt).filter((dateStr) => new Date(dateStr).getDate() === 1)}
          tickFormatter={(dateStr) => monthYearFormatter.format(new Date(dateStr))}
          angle={45}
          textAnchor="start"
        />
        <YAxis dataKey={'playCount' satisfies DataKey} domain={[0, yMax]} />
        <Area
          type="monotone"
          dataKey={'playCount' satisfies DataKey}
          stroke={theme.palette.secondary.light}
          fill="url(#colorPlays)"
        />
        <Area
          type="monotone"
          dataKey={'migratedPlayCount' satisfies DataKey}
          stroke={theme.palette.secondary.light}
          fill="url(#colorMigratedPlays)"
          strokeDasharray="4"
        />
        <Tooltip
          labelFormatter={(label: DataLabel) => dateFormatter.format(new Date(label))}
          formatter={(value, label: DataLabel) => [
            value,
            label === 'migratedPlayCount' ? t('dataKey.migratedPlays') : t('dataKey.plays')
          ]}
          contentStyle={{
            backgroundColor: theme.palette.background.default,
            borderColor: theme.palette.secondary.main,
            borderRadius: theme.shape.borderRadius
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

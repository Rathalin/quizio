import { MonthlyPlays } from '@/api-client';
import { useTheme } from '@mui/material/styles';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { AreaChart, Area, CartesianGrid, YAxis, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

type Props = {
  quizUuid: string;
  monthlyPlays: MonthlyPlays[];
};

export function TrendPreview({ quizUuid, monthlyPlays }: Props) {
  const theme = useTheme();
  const t = useTranslations('myQuizzesTrends.graph');
  const { locale } = useRouter();

  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale === 'de' ? 'de-AT' : 'en-GB', { month: 'short', year: 'numeric' }),
    [locale]
  );

  function roundUpToNextMultipleOfFive(n: number): number {
    return ((n + 4) / 5) * 5;
  }

  const yMax = useMemo(
    () => roundUpToNextMultipleOfFive(Math.max(...monthlyPlays.map((entry) => entry.plays ?? 0))),
    [monthlyPlays]
  );

  return (
    <ResponsiveContainer height={300}>
      <AreaChart key={quizUuid} data={monthlyPlays} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
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
          dataKey="month"
          tickFormatter={(month) => {
            const [year, monthIndex] = month.split('-').map(Number); // Split "2025-03" into year & month
            const date = new Date(year, monthIndex - 1); // Month is 0-based in JS
            return dateFormatter.format(date);
          }}
        />
        <YAxis dataKey="plays" domain={[0, yMax]} />
        <Area type="bump" dataKey="plays" stroke={theme.palette.secondary.light} fill="url(#colorPlays)" />
        <Area
          type="bump"
          dataKey="migratedPlays"
          stroke={theme.palette.secondary.light}
          fill="url(#colorMigratedPlays)"
          strokeDasharray="4"
        />
        <Tooltip
          formatter={(value, name) => [
            value,
            name === 'migratedPlays' ? t('dataKey.migratedPlays') : t('dataKey.plays')
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

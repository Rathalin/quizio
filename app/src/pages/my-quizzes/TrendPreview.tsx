import { MonthlyPlays } from '@/api-client';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import { AreaChart, Area, CartesianGrid, YAxis } from 'recharts';

const yMax = 25;

type Props = {
  monthlyPlays: MonthlyPlays[];
};

export function TrendPreview({ monthlyPlays }: Props) {
  const theme = useTheme();

  return (
    <Stack sx={{ marginLeft: -8, marginTop: -2 }}>
      <AreaChart data={monthlyPlays} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} width={250} height={90}>
        <defs>
          <linearGradient id="colorPlayCount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={theme.palette.secondary.main} stopOpacity={0.8} />
            <stop offset="95%" stopColor={theme.palette.secondary.dark} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeOpacity={0.2} />
        <YAxis dataKey="plays" domain={[0, yMax]} />
        <Area
          type="bump"
          dataKey="plays"
          stroke={theme.palette.secondary.light}
          fill="url(#colorPlayCount)"
          isAnimationActive={false}
        />
        <Area
          type="bump"
          dataKey="migratedPlays"
          stroke={theme.palette.secondary.light}
          fill="url(#colorPlayCount)"
          isAnimationActive={false}
          strokeDasharray="4"
        />
      </AreaChart>
    </Stack>
  );
}

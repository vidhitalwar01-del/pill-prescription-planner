import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { format, subDays } from "date-fns";

interface AdherenceChartProps {
  medications: any[];
  logs: Record<string, boolean>;
}

const AdherenceChart = ({ medications, logs }: AdherenceChartProps) => {
  // Generate last 14 days of data
  const generateChartData = () => {
    const data = [];
    
    for (let i = 13; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, "yyyy-MM-dd");
      let taken = 0;
      let total = 0;
      
      for (const med of medications) {
        const medStartDate = new Date(med.start_date);
        if (date >= medStartDate) {
          total++;
          const key = `${med.id}-${dateStr}`;
          if (logs[key]) {
            taken++;
          }
        }
      }
      
      data.push({
        date: format(date, "MMM d"),
        taken,
        total,
        percentage: total > 0 ? Math.round((taken / total) * 100) : 0,
      });
    }
    
    return data;
  };

  const data = generateChartData();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{payload[0].payload.date}</p>
          <p className="text-sm text-accent">
            {payload[0].payload.taken} of {payload[0].payload.total} taken
          </p>
          <p className="text-xs text-muted-foreground">
            {payload[0].payload.percentage}% adherence
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Bar Chart - Daily Adherence */}
      <Card className="animate-fade-in shadow-strong border-border/50 backdrop-blur-sm bg-card/95 hover:shadow-glow transition-all">
        <CardHeader>
          <CardTitle>Daily Progress</CardTitle>
          <CardDescription>Last 14 days medication adherence</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="taken" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Line Chart - Adherence Trend */}
      <Card className="animate-fade-in shadow-strong border-border/50 backdrop-blur-sm bg-card/95 hover:shadow-glow transition-all" style={{ animationDelay: "0.1s" }}>
        <CardHeader>
          <CardTitle>Adherence Trend</CardTitle>
          <CardDescription>Your wellness consistency over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="percentage"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdherenceChart;

import { Card, CardContent, CardHeader, CardTitle } from "/components/ui/card"

interface StatsCardProps {
  title: string
  stats: {
    mean?: number
    median?: number
    std?: number
  }
}

export function StatsCard({ title, stats }: StatsCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {stats.mean !== undefined && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Average:</span>
              <span>{stats.mean.toFixed(2)}</span>
            </div>
          )}
          {stats.median !== undefined && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Median:</span>
              <span>{stats.median.toFixed(2)}</span>
            </div>
          )}
          {stats.std !== undefined && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Std Dev:</span>
              <span>{stats.std.toFixed(2)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

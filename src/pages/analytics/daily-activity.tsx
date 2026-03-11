import { useMemo } from "react";
import { useList } from "@refinedev/core";
import { Alert, Card, Col, Empty, Row, Statistic, Typography } from "antd";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { colors } from "../../theme/colors";

type DailyActiveUsers = {
    date: string;
    active_users: number;
};

const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export const DailyActivityPage = () => {
    const { result, query } = useList<DailyActiveUsers>({
        resource: "admin/analytics/daily-active-users",
        pagination: { mode: "off" },
        sorters: [{ field: "date", order: "asc" }],
    });

    const chartData = useMemo(
        () => (result.data ?? []).map((item) => ({ ...item, label: formatDate(item.date) })),
        [result.data],
    );

    const latestCount = chartData.length > 0 ? chartData[chartData.length - 1].active_users : 0;
    const averageCount = chartData.length > 0
        ? chartData.reduce((sum, item) => sum + item.active_users, 0) / chartData.length
        : 0;

    if (query.isError) {
        return <Alert type="error" showIcon message="Failed to load daily activity" description={query.error?.message} />;
    }

    return (
        <div style={{ padding: 20 }}>
            <Typography.Title level={3} style={{ marginTop: 0 }}>Daily User Activity</Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginTop: -8 }}>
                Counts unique active users per day, not total activity rows.
            </Typography.Paragraph>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} md={12}>
                    <Card>
                        <Statistic title="Latest Active Users" value={latestCount} loading={query.isLoading} />
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card>
                        <Statistic title="30-Day Average" value={averageCount} precision={1} loading={query.isLoading} />
                    </Card>
                </Col>
            </Row>
            <Card title="Daily Active Users Trend" loading={query.isLoading}>
                {chartData.length > 0 ? (
                    <div style={{ width: "100%", height: 360, background: colors.backgroundLight, borderRadius: 10, padding: "8px 4px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                                <CartesianGrid stroke={colors.backgroundLighter} strokeDasharray="3 3" />
                                <XAxis dataKey="label" stroke={colors.textSecondary} tick={{ fill: colors.textSecondary, fontSize: 12 }} />
                                <YAxis allowDecimals={false} stroke={colors.textSecondary} tick={{ fill: colors.textSecondary, fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        background: colors.backgroundLight,
                                        border: `1px solid ${colors.backgroundLighter}`,
                                        borderRadius: 8,
                                        color: colors.textPrimary,
                                    }}
                                    formatter={(value: number) => [value, "Active users"]}
                                    labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ""}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="active_users"
                                    stroke={colors.primary}
                                    strokeWidth={3}
                                    dot={{ r: 3, fill: colors.primary }}
                                    activeDot={{ r: 6, fill: colors.primaryLight }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div style={{ minHeight: 280, display: "flex", alignItems: "center", justifyContent: "center", background: colors.backgroundLight, borderRadius: 10 }}>
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={<Typography.Text style={{ color: colors.textSecondary }}>No daily activity data available yet</Typography.Text>}
                        />
                    </div>
                )}
            </Card>
        </div>
    );
};

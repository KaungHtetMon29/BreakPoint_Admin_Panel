import { useMemo, useState } from "react";
import { useList } from "@refinedev/core";
import { Alert, Card, Col, Empty, Input, Row, Statistic, Table, Typography } from "antd";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { colors } from "../../theme/colors";

type MonthlyRevenue = {
    month: string;
    subscriptions: number;
    revenue: number;
    currency: string;
};

const formatMonth = (value: string) => {
    const date = new Date(`${value}-01T00:00:00Z`);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
};

const formatRevenue = (amount: number) => amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export const MonthlyRevenuePage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const { result, query } = useList<MonthlyRevenue>({
        resource: "admin/analytics/monthly-revenue",
        pagination: { mode: "off" },
    });

    const rows = useMemo(() => result.data ?? [], [result.data]);
    const chartData = useMemo(() => rows.map((row) => ({ ...row, label: formatMonth(row.month) })), [rows]);
    const filteredRows = useMemo(() => {
        const keyword = searchQuery.trim().toLowerCase();
        if (!keyword) {
            return rows;
        }
        return rows.filter((row) => {
            const monthLabel = formatMonth(row.month).toLowerCase();
            return monthLabel.includes(keyword) || row.currency.toLowerCase().includes(keyword);
        });
    }, [rows, searchQuery]);

    const totalRevenue = useMemo(
        () => rows.reduce((sum, row) => sum + row.revenue, 0),
        [rows],
    );
    const currentMonth = rows.length > 0 ? rows[rows.length - 1] : undefined;

    if (query.isError) {
        return <Alert type="error" showIcon message="Failed to load monthly revenue" description={query.error?.message} />;
    }

    return (
        <div style={{ padding: 20 }}>
            <Typography.Title level={3} style={{ marginTop: 0 }}>Monthly Revenue</Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginTop: -8 }}>
                Tracks monthly subscription revenue from premium plan activations.
            </Typography.Paragraph>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} md={8}>
                    <Card>
                        <Statistic title="Current Month Revenue" value={currentMonth?.revenue ?? 0} formatter={(value) => `THB ${formatRevenue(Number(value ?? 0))}`} loading={query.isLoading} />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card>
                        <Statistic title="Current Month Subscriptions" value={currentMonth?.subscriptions ?? 0} loading={query.isLoading} />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card>
                        <Statistic title="12-Month Revenue" value={totalRevenue} formatter={(value) => `THB ${formatRevenue(Number(value ?? 0))}`} loading={query.isLoading} />
                    </Card>
                </Col>
            </Row>
            <Card title="Revenue Trend (12 Months)" loading={query.isLoading} style={{ marginBottom: 16 }}>
                {chartData.length > 0 ? (
                    <div style={{ width: "100%", height: 340, background: colors.backgroundLight, borderRadius: 10, padding: "8px 4px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                                <CartesianGrid stroke={colors.backgroundLighter} strokeDasharray="3 3" />
                                <XAxis dataKey="label" stroke={colors.textSecondary} tick={{ fill: colors.textSecondary, fontSize: 12 }} />
                                <YAxis stroke={colors.textSecondary} tick={{ fill: colors.textSecondary, fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        background: colors.backgroundLight,
                                        border: `1px solid ${colors.backgroundLighter}`,
                                        borderRadius: 8,
                                        color: colors.textPrimary,
                                    }}
                                    formatter={(value: number, name) => {
                                        if (name === "revenue") {
                                            return [`THB ${formatRevenue(value ?? 0)}`, "Revenue"];
                                        }
                                        return [value, "Subscriptions"];
                                    }}
                                    labelFormatter={(label) => String(label)}
                                />
                                <Bar dataKey="revenue" fill={colors.primary} radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div style={{ minHeight: 260, display: "flex", alignItems: "center", justifyContent: "center", background: colors.backgroundLight, borderRadius: 10 }}>
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={<Typography.Text style={{ color: colors.textSecondary }}>No subscription revenue data available yet</Typography.Text>}
                        />
                    </div>
                )}
            </Card>
            <Input
                placeholder="Search by month or currency"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                allowClear
                style={{ marginBottom: 16, maxWidth: 360 }}
            />
            <Card title="Monthly Breakdown" loading={query.isLoading}>
                <Table
                    dataSource={filteredRows}
                    rowKey="month"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        pageSizeOptions: [10, 20, 50],
                    }}
                >
                    <Table.Column<MonthlyRevenue>
                        dataIndex="month"
                        title="Month"
                        render={(value: string) => formatMonth(value)}
                        sorter={(a, b) => a.month.localeCompare(b.month)}
                    />
                    <Table.Column<MonthlyRevenue>
                        dataIndex="subscriptions"
                        title="Subscriptions"
                        sorter={(a, b) => a.subscriptions - b.subscriptions}
                    />
                    <Table.Column<MonthlyRevenue>
                        dataIndex="revenue"
                        title="Revenue"
                        render={(value: number) => `THB ${formatRevenue(value)}`}
                        sorter={(a, b) => a.revenue - b.revenue}
                    />
                    <Table.Column<MonthlyRevenue>
                        dataIndex="currency"
                        title="Currency"
                        sorter={(a, b) => a.currency.localeCompare(b.currency)}
                    />
                </Table>
            </Card>
        </div>
    );
};

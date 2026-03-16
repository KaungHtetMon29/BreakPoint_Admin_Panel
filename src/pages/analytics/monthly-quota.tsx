import { useMemo, useState } from "react";
import { useList } from "@refinedev/core";
import { Alert, Card, Input, Progress, Table, Typography } from "antd";

type MonthlyQuotaUtilization = {
    user_uuid: string;
    username: string;
    email: string;
    plan_uuid: string;
    plan_type: string;
    used_count: number;
    quota_limit: number;
    utilization_percent: number;
};

export const MonthlyQuotaPage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const { result, query } = useList<MonthlyQuotaUtilization>({
        resource: "admin/analytics/monthly-quota-utilization",
        pagination: { mode: "off" },
    });

    const rows = useMemo(() => result.data ?? [], [result.data]);
    const filteredRows = useMemo(() => {
        const keyword = searchQuery.trim().toLowerCase();
        if (!keyword) {
            return rows;
        }
        return rows.filter((row) => row.email?.toLowerCase().includes(keyword) || row.username?.toLowerCase().includes(keyword));
    }, [rows, searchQuery]);

    if (query.isError) {
        return <Alert type="error" showIcon message="Failed to load monthly quota data" description={query.error?.message} />;
    }

    return (
        <div style={{ padding: 20 }}>
            <Typography.Title level={3} style={{ marginTop: 0 }}>Monthly Quota Utilization</Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginTop: -8 }}>
                Tracks current month usage against each user's active plan quota.
            </Typography.Paragraph>
            <Input
                placeholder="Search by user or email"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                allowClear
                style={{ marginBottom: 16, maxWidth: 360 }}
            />
            <Card loading={query.isLoading}>
                <Table
                    dataSource={filteredRows}
                    rowKey="plan_uuid"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        pageSizeOptions: [10, 20, 50],
                    }}
                >
                    <Table.Column<MonthlyQuotaUtilization>
                        dataIndex="username"
                        title="User"
                        sorter={(a, b) => a.username.localeCompare(b.username)}
                    />
                    <Table.Column<MonthlyQuotaUtilization>
                        dataIndex="email"
                        title="Email"
                        sorter={(a, b) => a.email.localeCompare(b.email)}
                    />
                    <Table.Column<MonthlyQuotaUtilization>
                        dataIndex="plan_type"
                        title="Plan"
                        sorter={(a, b) => a.plan_type.localeCompare(b.plan_type)}
                    />
                    <Table.Column<MonthlyQuotaUtilization>
                        dataIndex="used_count"
                        title="Used"
                        sorter={(a, b) => a.used_count - b.used_count}
                    />
                    <Table.Column<MonthlyQuotaUtilization>
                        dataIndex="quota_limit"
                        title="Limit"
                        sorter={(a, b) => a.quota_limit - b.quota_limit}
                    />
                    <Table.Column<MonthlyQuotaUtilization>
                        title="Utilization"
                        sorter={(a, b) => a.utilization_percent - b.utilization_percent}
                        render={(_, record) => (
                            <Progress
                                percent={Math.min(record.utilization_percent, 100)}
                                status={record.utilization_percent >= 100 ? "exception" : "active"}
                                size="small"
                                format={(percent) => `${(percent ?? 0).toFixed(2)}%`}
                            />
                        )}
                    />
                </Table>
            </Card>
        </div>
    );
};

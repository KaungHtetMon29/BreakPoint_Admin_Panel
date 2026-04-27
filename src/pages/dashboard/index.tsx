
import { useMemo, useState } from "react";
import { useList } from "@refinedev/core";
import { Card, Typography, Row, Col, Alert, Input, Table, Tag, Statistic } from "antd";

const { Title } = Typography;

type DailyActiveUsers = {
  date: string;
  active_users: number;
};

type MonthlyQuotaUtilization = {
  user_uuid: string;
  username: string;
  plan_uuid: string;
  plan_type: string;
  used_count: number;
  quota_limit: number;
  utilization_percent: number;
};

type PlanExpiryRisk = {
  user_uuid: string;
  username: string;
  plan_uuid: string;
  plan_type: string;
  plan_end_date: string;
  days_left: number;
  risk_level: "expired" | "high" | "medium" | "low";
};

export const Dashboard = () => {
  const [expirySearchQuery, setExpirySearchQuery] = useState("");
  const { result: dauResult, query: dauQuery } = useList<DailyActiveUsers>({
    resource: "admin/analytics/daily-active-users",
    pagination: { mode: "off" },
    sorters: [
        {
            field: "date",
            order: "asc",
        },
    ],
  });

  const { result: quotaResult, query: quotaQuery } = useList<MonthlyQuotaUtilization>({
    resource: "admin/analytics/monthly-quota-utilization",
    pagination: { mode: "off" },
  });

  const { result: expiryResult, query: expiryQuery } = useList<PlanExpiryRisk>({
    resource: "admin/analytics/plan-expiry-risk",
    pagination: { mode: "off" },
  });

  const dauData = useMemo(() => {
    return dauResult.data || [];
  }, [dauResult.data]);

  const quotaData = useMemo(() => {
    return quotaResult.data || [];
  }, [quotaResult.data]);

  const expiryData = useMemo(() => {
    return expiryResult.data || [];
  }, [expiryResult.data]);
  const filteredExpiryData = useMemo(() => {
    const keyword = expirySearchQuery.trim().toLowerCase();
    if (!keyword) {
      return expiryData;
    }
    return expiryData.filter((item) => {
      return (
        item.username?.toLowerCase().includes(keyword) ||
        item.plan_type?.toLowerCase().includes(keyword) ||
        item.risk_level?.toLowerCase().includes(keyword) ||
        item.plan_end_date?.toLowerCase().includes(keyword)
      );
    });
  }, [expiryData, expirySearchQuery]);

  const latestDau = dauData.length > 0 ? dauData[dauData.length - 1].active_users : 0;
  const averageUtilization = quotaData.length > 0
      ? quotaData.reduce((sum, item) => sum + item.utilization_percent, 0) / quotaData.length
      : 0;
  const highRiskCount = expiryData.filter((item) => item.risk_level === "expired" || item.risk_level === "high").length;

  if (dauQuery.isError || quotaQuery.isError || expiryQuery.isError) {
      return (
          <div style={{ padding: "20px" }}>
              <Alert 
                message="Error loading analytics data" 
                description={dauQuery.error?.message || quotaQuery.error?.message || expiryQuery.error?.message} 
                type="error" 
                showIcon 
              />
          </div>
      );
  }

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Dashboard</Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Latest Daily Active Users" value={latestDau} loading={dauQuery.isLoading} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Avg Monthly Utilization" value={averageUtilization} precision={2} suffix="%" loading={quotaQuery.isLoading} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="High Expiry Risk Users" value={highRiskCount} loading={expiryQuery.isLoading} />
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Plan Expiry Risk (Next 14 Days)" loading={expiryQuery.isLoading}>
            <Input
              placeholder="Search by user, plan, risk, or end date"
              value={expirySearchQuery}
              onChange={(event) => setExpirySearchQuery(event.target.value)}
              allowClear
              style={{ marginBottom: 16, maxWidth: 420 }}
            />
            <Table<PlanExpiryRisk>
              dataSource={filteredExpiryData}
              rowKey="plan_uuid"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: [10, 20, 50],
              }}
            >
              <Table.Column<PlanExpiryRisk> dataIndex="username" title="User" sorter={(a, b) => a.username.localeCompare(b.username)} />
              <Table.Column<PlanExpiryRisk> dataIndex="plan_type" title="Plan" sorter={(a, b) => a.plan_type.localeCompare(b.plan_type)} />
              <Table.Column<PlanExpiryRisk> dataIndex="plan_end_date" title="End Date" sorter={(a, b) => a.plan_end_date.localeCompare(b.plan_end_date)} />
              <Table.Column<PlanExpiryRisk> dataIndex="days_left" title="Days Left" sorter={(a, b) => a.days_left - b.days_left} />
              <Table.Column<PlanExpiryRisk>
                title="Risk"
                sorter={(a, b) => a.risk_level.localeCompare(b.risk_level)}
                render={(_, record: PlanExpiryRisk) => (
                  <Tag color={
                    record.risk_level === "expired" || record.risk_level === "high"
                      ? "red"
                      : record.risk_level === "medium"
                        ? "orange"
                        : "gold"
                  }>
                    {record.risk_level}
                  </Tag>
                )}
              />
            </Table>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

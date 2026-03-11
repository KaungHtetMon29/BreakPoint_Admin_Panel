import { List, useTable } from "@refinedev/antd";
import { Card, Col, Row, Statistic, Table } from "antd";
import { useMemo } from "react";

type FeedbackRecord = {
    uuid: string;
    user_uuid: string;
    username: string;
    email: string;
    message: string;
    created_at: string;
};

export const FeedbackList = () => {
    const { tableProps } = useTable<FeedbackRecord>({
        resource: "admin/feedbacks",
        syncWithLocation: true,
    });

    const feedbackData = useMemo(() => {
        return (tableProps.dataSource ?? []) as FeedbackRecord[];
    }, [tableProps.dataSource]);

    return (
        <List title="User Feedback">
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} md={12}>
                    <Card>
                        <Statistic title="Feedback Entries" value={feedbackData.length} />
                    </Card>
                </Col>
            </Row>
            <Table {...tableProps} rowKey="uuid">
                <Table.Column dataIndex="username" title="Username" />
                <Table.Column dataIndex="email" title="Email" />
                <Table.Column dataIndex="message" title="Feedback" />
                <Table.Column dataIndex="created_at" title="Created At" />
            </Table>
        </List>
    );
};

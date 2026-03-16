import { List, useTable } from "@refinedev/antd";
import { Card, Col, Input, Row, Statistic, Table } from "antd";
import { useMemo, useState } from "react";

type FeedbackRecord = {
    uuid: string;
    user_uuid: string;
    username: string;
    email: string;
    message: string;
    created_at: string;
};

export const FeedbackList = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const { tableProps } = useTable<FeedbackRecord>({
        resource: "admin/feedbacks",
        syncWithLocation: true,
    });

    const feedbackData = useMemo(() => {
        return (tableProps.dataSource ?? []) as FeedbackRecord[];
    }, [tableProps.dataSource]);
    const filteredFeedbackData = useMemo(() => {
        const keyword = searchQuery.trim().toLowerCase();
        if (!keyword) {
            return feedbackData;
        }
        return feedbackData.filter((row) => {
            return (
                row.username?.toLowerCase().includes(keyword) ||
                row.email?.toLowerCase().includes(keyword) ||
                row.message?.toLowerCase().includes(keyword)
            );
        });
    }, [feedbackData, searchQuery]);

    return (
        <List title="User Feedback">
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} md={12}>
                    <Card>
                        <Statistic title="Feedback Entries" value={filteredFeedbackData.length} />
                    </Card>
                </Col>
            </Row>
            <Input
                placeholder="Search by username, email, or feedback"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                allowClear
                style={{ marginBottom: 16, maxWidth: 420 }}
            />
            <Table {...tableProps} dataSource={filteredFeedbackData} rowKey="uuid">
                <Table.Column dataIndex="username" title="Username" sorter={(a, b) => a.username.localeCompare(b.username)} />
                <Table.Column dataIndex="email" title="Email" sorter={(a, b) => a.email.localeCompare(b.email)} />
                <Table.Column dataIndex="message" title="Feedback" sorter={(a, b) => a.message.localeCompare(b.message)} />
                <Table.Column dataIndex="created_at" title="Created At" sorter={(a, b) => a.created_at.localeCompare(b.created_at)} />
            </Table>
        </List>
    );
};

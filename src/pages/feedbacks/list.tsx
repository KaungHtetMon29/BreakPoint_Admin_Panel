import { List, useTable } from "@refinedev/antd";
import { Card, Col, Input, Modal, Row, Statistic, Table, Typography } from "antd";
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
    const [selectedFeedback, setSelectedFeedback] = useState<FeedbackRecord | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
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
    const totalFeedbackCount =
        tableProps.pagination && typeof tableProps.pagination === "object"
            ? (tableProps.pagination.total ?? feedbackData.length)
            : feedbackData.length;

    const openDetailModal = (record: FeedbackRecord) => {
        setSelectedFeedback(record);
        setIsDetailOpen(true);
    };

    const closeDetailModal = () => {
        setIsDetailOpen(false);
        setSelectedFeedback(null);
    };

    const formatDateTime = (value?: string) => {
        if (!value) {
            return "-";
        }
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return value;
        }
        return date.toLocaleString();
    };

    return (
        <List title="User Feedback">
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} md={12}>
                    <Card>
                        <Statistic title="Feedback Entries" value={totalFeedbackCount} />
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
            <Table
                {...tableProps}
                dataSource={filteredFeedbackData}
                rowKey="uuid"
                onRow={(record) => ({
                    onClick: () => openDetailModal(record),
                    style: { cursor: "pointer" },
                })}
            >
                <Table.Column dataIndex="username" title="Username" sorter={(a, b) => a.username.localeCompare(b.username)} />
                <Table.Column dataIndex="email" title="Email" sorter={(a, b) => a.email.localeCompare(b.email)} />
                <Table.Column
                    dataIndex="message"
                    title="Feedback"
                    sorter={(a, b) => a.message.localeCompare(b.message)}
                    render={(value: string) => (
                        <Typography.Text ellipsis={{ tooltip: value }} style={{ maxWidth: 520 }}>
                            {value}
                        </Typography.Text>
                    )}
                />
                <Table.Column dataIndex="created_at" title="Created At" sorter={(a, b) => a.created_at.localeCompare(b.created_at)} />
            </Table>
            <Modal
                title="Feedback Detail"
                open={isDetailOpen}
                onCancel={closeDetailModal}
                footer={null}
                width={760}
                destroyOnHidden
            >
                <Row gutter={[12, 12]} style={{ marginBottom: 8 }}>
                    <Col span={12}>
                        <Typography.Text strong>Username:</Typography.Text>{" "}
                        <Typography.Text>{selectedFeedback?.username || "-"}</Typography.Text>
                    </Col>
                    <Col span={12}>
                        <Typography.Text strong>Email:</Typography.Text>{" "}
                        <Typography.Text>{selectedFeedback?.email || "-"}</Typography.Text>
                    </Col>
                    <Col span={12}>
                        <Typography.Text strong>Created At:</Typography.Text>{" "}
                        <Typography.Text>{formatDateTime(selectedFeedback?.created_at)}</Typography.Text>
                    </Col>
                </Row>
                <Typography.Title level={5} style={{ marginTop: 12 }}>
                    Feedback Message
                </Typography.Title>
                <Card size="small">
                    <Typography.Paragraph style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}>
                        {selectedFeedback?.message || "-"}
                    </Typography.Paragraph>
                </Card>
            </Modal>
        </List>
    );
};

import { List, useTable } from "@refinedev/antd";
import { Card, Col, Input, Row, Statistic, Table } from "antd";
import { useMemo, useState } from "react";

type ConsentRecord = {
    uuid: string;
    username: string;
    email: string;
    created_at: string;
};

export const ConsentList = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const { tableProps } = useTable<ConsentRecord>({
        resource: "admin/consents/accepted",
        syncWithLocation: true,
    });

    const consentData = useMemo(() => {
        return (tableProps.dataSource ?? []) as ConsentRecord[];
    }, [tableProps.dataSource]);
    const filteredConsentData = useMemo(() => {
        const keyword = searchQuery.trim().toLowerCase();
        if (!keyword) {
            return consentData;
        }
        return consentData.filter((row) => {
            return row.email?.toLowerCase().includes(keyword) || row.username?.toLowerCase().includes(keyword);
        });
    }, [consentData, searchQuery]);

    return (
        <List title="User Consent Accepted">
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} md={12}>
                    <Card>
                        <Statistic title="Accepted Users" value={filteredConsentData.length} />
                    </Card>
                </Col>
            </Row>

            <Input
                placeholder="Search by username or email"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                allowClear
                style={{ marginBottom: 16, maxWidth: 360 }}
            />
            <Table {...tableProps} dataSource={filteredConsentData} rowKey="uuid">
                <Table.Column dataIndex="username" title="Username" sorter={(a, b) => a.username.localeCompare(b.username)} />
                <Table.Column dataIndex="email" title="Email" sorter={(a, b) => a.email.localeCompare(b.email)} />
                <Table.Column dataIndex="created_at" title="Created At" sorter={(a, b) => a.created_at.localeCompare(b.created_at)} />
            </Table>
        </List>
    );
};

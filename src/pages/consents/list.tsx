import { List, useTable } from "@refinedev/antd";
import { Card, Col, Row, Statistic, Table } from "antd";
import { useMemo } from "react";

type ConsentRecord = {
    uuid: string;
    username: string;
    email: string;
    created_at: string;
};

export const ConsentList = () => {
    const { tableProps } = useTable<ConsentRecord>({
        resource: "admin/consents/accepted",
        syncWithLocation: true,
    });

    const consentData = useMemo(() => {
        return (tableProps.dataSource ?? []) as ConsentRecord[];
    }, [tableProps.dataSource]);

    return (
        <List title="User Consent Accepted">
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} md={12}>
                    <Card>
                        <Statistic title="Accepted Users" value={consentData.length} />
                    </Card>
                </Col>
            </Row>

            <Table {...tableProps} rowKey="uuid">
                <Table.Column dataIndex="username" title="Username" />
                <Table.Column dataIndex="email" title="Email" />
                <Table.Column dataIndex="created_at" title="Created At" />
            </Table>
        </List>
    );
};

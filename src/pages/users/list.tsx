
import { List, useTable, EditButton, ShowButton } from "@refinedev/antd";
import { Table, Space, Tag } from "antd";

type UserRecord = {
  uuid: string;
};

export const UserList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  return (
    <List>
      <Table {...tableProps} rowKey="uuid">
        <Table.Column dataIndex="username" title="Username" />
        <Table.Column dataIndex="email" title="Email" />
        <Table.Column 
            dataIndex="plan_type" 
            title="Plan Type"
            render={(value) => (
                <Tag color={value === "Enterprise" ? "gold" : value === "Pro" ? "blue" : "default"}>
                    {value}
                </Tag>
            )}
        />
        <Table.Column dataIndex="total_usage" title="Total Usage" />
        <Table.Column
            dataIndex="data_consent"
            title="Consent"
            render={(value) => (
                <Tag color={value ? "green" : "default"}>
                    {value ? "Accepted" : "Pending"}
                </Tag>
            )}
        />
        <Table.Column 
            dataIndex="status" 
            title="Status"
            render={(value) => (
                <Tag color={value === "active" ? "green" : "red"}>
                    {value}
                </Tag>
            )}
        />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: UserRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.uuid} />
              <ShowButton hideText size="small" recordItemId={record.uuid} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};

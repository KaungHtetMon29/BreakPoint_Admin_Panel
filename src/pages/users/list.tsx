
import { useMemo, useState } from "react";
import { List, useTable, EditButton, ShowButton } from "@refinedev/antd";
import { Input, Table, Space, Tag } from "antd";

type UserRecord = {
  uuid: string;
};

export const UserList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { tableProps } = useTable({
    syncWithLocation: true,
  });
  const filteredData = useMemo(() => {
    const rows = (tableProps.dataSource ?? []) as Array<{ email?: string; username?: string }>;
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) {
      return rows;
    }
    return rows.filter((row) =>
      row.email?.toLowerCase().includes(keyword) || row.username?.toLowerCase().includes(keyword)
    );
  }, [tableProps.dataSource, searchQuery]);

  return (
    <List>
      <Input
        placeholder="Search by username or email"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        allowClear
        style={{ marginBottom: 16, maxWidth: 360 }}
      />
      <Table {...tableProps} dataSource={filteredData} rowKey="uuid">
        <Table.Column dataIndex="username" title="Username" sorter={(a, b) => String(a.username ?? "").localeCompare(String(b.username ?? ""))} />
        <Table.Column dataIndex="email" title="Email" sorter={(a, b) => String(a.email ?? "").localeCompare(String(b.email ?? ""))} />
        <Table.Column 
            dataIndex="plan_type" 
            title="Plan Type"
            sorter={(a, b) => String(a.plan_type ?? "").localeCompare(String(b.plan_type ?? ""))}
            render={(value) => (
                <Tag color={value === "Enterprise" ? "gold" : value === "Pro" ? "blue" : "default"}>
                    {value}
                </Tag>
            )}
        />
        <Table.Column dataIndex="total_usage" title="Total Usage" sorter={(a, b) => Number(a.total_usage ?? 0) - Number(b.total_usage ?? 0)} />
        <Table.Column
            dataIndex="data_consent"
            title="Consent"
            sorter={(a, b) => Number(Boolean(a.data_consent)) - Number(Boolean(b.data_consent))}
            render={(value) => (
                <Tag color={value ? "green" : "default"}>
                    {value ? "Accepted" : "Pending"}
                </Tag>
            )}
        />
        <Table.Column 
            dataIndex="status" 
            title="Status"
            sorter={(a, b) => String(a.status ?? "").localeCompare(String(b.status ?? ""))}
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


import { Show, TextField, EmailField } from "@refinedev/antd";
import { Typography, Tag } from "antd";
import { useShow } from "@refinedev/core";

const { Title } = Typography;

export const UserShow = () => {
  const { result, query } = useShow();
  const record = result;

  return (
    <Show isLoading={query.isLoading}>
      <Title level={5}>Username</Title>
      <TextField value={record?.username} />

      <Title level={5}>Email</Title>
      <EmailField value={record?.email} />

      <Title level={5}>Plan Type</Title>
      <Tag color={record?.plan_type === "Enterprise" ? "gold" : record?.plan_type === "Pro" ? "blue" : "default"}>
        {record?.plan_type}
      </Tag>

      <Title level={5}>Total Usage</Title>
      <TextField value={record?.total_usage} />

      <Title level={5}>Consent</Title>
      <Tag color={record?.data_consent ? "green" : "default"}>
        {record?.data_consent ? "Accepted" : "Pending"}
      </Tag>

      <Title level={5}>Status</Title>
      <Tag color={record?.status === "active" ? "green" : "red"}>
        {record?.status}
      </Tag>
    </Show>
  );
};

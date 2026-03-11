
import { Edit } from "@refinedev/antd";
import { Form, Input, Select, Button, Card, Space } from "antd";
import { useForm, useCustomMutation, useApiUrl } from "@refinedev/core";

type StatusFormValues = {
    status: "active" | "banned";
};

type PasswordFormValues = {
    password: string;
};

export const UserEdit = () => {
    const apiUrl = useApiUrl();
    const { query } = useForm();
    const record = query?.data?.data;

    const { mutate: updateStatus, mutation: statusMutation } = useCustomMutation();
    const { mutate: updatePassword, mutation: passwordMutation } = useCustomMutation();

    const onStatusFinish = (values: StatusFormValues) => {
        if (!record?.uuid) return;
        updateStatus(
            {
                url: `${apiUrl}/admin/users/${record.uuid}/status`,
                method: "patch",
                values: { status: values.status },
                successNotification: () => {
                    return {
                        message: `Status updated successfully`,
                        description: "Success",
                        type: "success",
                    };
                },
            }
        );
    };

    const onPasswordFinish = (values: PasswordFormValues) => {
        if (!record?.uuid) return;
        updatePassword(
            {
                url: `${apiUrl}/admin/users/${record.uuid}/password`,
                method: "put",
                values: { password: values.password },
                successNotification: () => {
                    return {
                        message: `Password updated successfully`,
                        description: "Success",
                        type: "success",
                    };
                },
            }
        );
    };

    return (
        <Edit title="Edit User" saveButtonProps={{ style: { display: "none" } }}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <Card title="Update Status">
                    <Form
                        layout="vertical"
                        initialValues={{ status: record?.status }}
                        onFinish={onStatusFinish}
                        key={record?.status}
                    >
                        <Form.Item label="Status" name="status" rules={[{ required: true }]}>
                            <Select>
                                <Select.Option value="active">Active</Select.Option>
                                <Select.Option value="banned">Banned</Select.Option>
                            </Select>
                        </Form.Item>
                        <Button type="primary" htmlType="submit" loading={statusMutation.isPending}>
                            Update Status
                        </Button>
                    </Form>
                </Card>

                <Card title="Change Password">
                    <Form layout="vertical" onFinish={onPasswordFinish}>
                        <Form.Item
                            label="New Password"
                            name="password"
                            rules={[{ required: true, min: 6 }]}
                        >
                            <Input.Password />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" danger loading={passwordMutation.isPending}>
                            Update Password
                        </Button>
                    </Form>
                </Card>
            </Space>
        </Edit>
    );
};

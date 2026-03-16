import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, Typography, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useApiUrl, useGetIdentity } from "@refinedev/core";

type AdminRecord = {
    uuid: string;
    username: string;
    email: string;
    level: "admin" | "super_admin";
    created_at: string;
};

type AdminFormValues = {
    username: string;
    email: string;
    level: "admin" | "super_admin";
    password?: string;
};

export const AdminManagementPage = () => {
    const apiUrl = useApiUrl();
    const { data: identity } = useGetIdentity<{ id?: string; email?: string }>();
    const [admins, setAdmins] = useState<AdminRecord[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<AdminRecord | null>(null);
    const [form] = Form.useForm<AdminFormValues>();
    const currentAdminId = identity?.id?.trim() ?? "";
    const currentAdminEmail = identity?.email?.trim().toLowerCase() ?? "";

    const getAuthHeader = () => {
        const token = localStorage.getItem("admin_access_token");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const fetchAdmins = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/admin/admins`, {
                headers: getAuthHeader(),
            });
            const adminRecords = Array.isArray(response.data) ? response.data as AdminRecord[] : [];
            const filteredAdmins = adminRecords.filter((admin) => {
                const isCurrentById = currentAdminId !== "" && admin.uuid === currentAdminId;
                const isCurrentByEmail = currentAdminEmail !== "" && admin.email.toLowerCase() === currentAdminEmail;
                return !isCurrentById && !isCurrentByEmail;
            });
            setAdmins(filteredAdmins);
        } catch (error) {
            const serverMessage = axios.isAxiosError(error)
                ? (error.response?.data?.error as string | undefined)
                : undefined;
            message.error({
                key: "admin-management-access-error",
                content: serverMessage || "Only super admins can manage admin accounts",
            });
            setAdmins([]);
        } finally {
            setIsLoading(false);
        }
    }, [apiUrl, currentAdminEmail, currentAdminId]);

    useEffect(() => {
        fetchAdmins();
    }, [fetchAdmins]);

    const openCreateModal = () => {
        setEditingAdmin(null);
        form.resetFields();
        form.setFieldsValue({ level: "admin" });
        setIsModalOpen(true);
    };

    const openEditModal = (record: AdminRecord) => {
        setEditingAdmin(record);
        form.setFieldsValue({
            username: record.username,
            email: record.email,
            level: record.level,
        });
        setIsModalOpen(true);
    };

    const onSave = async (values: AdminFormValues) => {
        setIsSaving(true);
        try {
            if (editingAdmin) {
                await axios.put(
                    `${apiUrl}/admin/admins/${editingAdmin.uuid}`,
                    {
                        username: values.username,
                        email: values.email,
                        level: values.level,
                        password: values.password || undefined,
                    },
                    { headers: getAuthHeader() },
                );
                message.success("Admin updated successfully");
            } else {
                await axios.post(
                    `${apiUrl}/admin/admins`,
                    {
                        username: values.username,
                        email: values.email,
                        password: values.password,
                        level: values.level,
                    },
                    { headers: getAuthHeader() },
                );
                message.success("Admin created successfully");
            }
            setIsModalOpen(false);
            form.resetFields();
            fetchAdmins();
        } catch {
            message.error("Failed to save admin account");
        } finally {
            setIsSaving(false);
        }
    };

    const onDelete = async (record: AdminRecord) => {
        try {
            await axios.delete(`${apiUrl}/admin/admins/${record.uuid}`, {
                headers: getAuthHeader(),
            });
            message.success("Admin deleted successfully");
            fetchAdmins();
        } catch {
            message.error("Failed to delete admin account");
        }
    };
    const filteredAdmins = admins.filter((admin) => {
        const keyword = searchQuery.trim().toLowerCase();
        if (!keyword) {
            return true;
        }
        return (
            admin.username.toLowerCase().includes(keyword) ||
            admin.email.toLowerCase().includes(keyword) ||
            admin.level.toLowerCase().includes(keyword)
        );
    });

    return (
        <Card
            title="Admin Accounts"
            extra={
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                    Add Admin
                </Button>
            }
        >
            <Typography.Paragraph type="secondary" style={{ marginTop: -6 }}>
                Only super admins can create, edit, and delete admin accounts.
            </Typography.Paragraph>
            <Input
                placeholder="Search by username, email, or level"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                allowClear
                style={{ marginBottom: 16, maxWidth: 420 }}
            />
            <Table<AdminRecord> rowKey="uuid" loading={isLoading} dataSource={filteredAdmins}>
                <Table.Column<AdminRecord>
                    title="Username"
                    dataIndex="username"
                    sorter={(a, b) => a.username.localeCompare(b.username)}
                />
                <Table.Column<AdminRecord>
                    title="Email"
                    dataIndex="email"
                    sorter={(a, b) => a.email.localeCompare(b.email)}
                />
                <Table.Column<AdminRecord>
                    title="Level"
                    dataIndex="level"
                    sorter={(a, b) => a.level.localeCompare(b.level)}
                    render={(value: AdminRecord["level"]) => (
                        <Tag color={value === "super_admin" ? "gold" : "blue"}>{value}</Tag>
                    )}
                />
                <Table.Column<AdminRecord>
                    title="Actions"
                    render={(_, record) => (
                        !record?.uuid ? null : (
                        <Space>
                            <Button size="small" onClick={() => openEditModal(record)}>
                                Edit
                            </Button>
                            <Popconfirm
                                title="Delete this admin?"
                                okText="Delete"
                                cancelText="Cancel"
                                onConfirm={() => onDelete(record)}
                            >
                                <Button size="small" danger>
                                    Delete
                                </Button>
                            </Popconfirm>
                        </Space>
                        )
                    )}
                />
            </Table>

            <Modal
                title={editingAdmin ? "Edit Admin" : "Create Admin"}
                open={isModalOpen}
                okText={editingAdmin ? "Update" : "Create"}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={isSaving}
                onOk={() => form.submit()}
            >
                <Form<AdminFormValues> form={form} layout="vertical" onFinish={onSave}>
                    <Form.Item name="username" label="Username" rules={[{ required: true, min: 3 }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="level" label="Level" rules={[{ required: true }]}>
                        <Select
                            options={[
                                { label: "Admin", value: "admin" },
                                { label: "Super Admin", value: "super_admin" },
                            ]}
                        />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label={editingAdmin ? "New Password (optional)" : "Password"}
                        rules={editingAdmin ? [{ min: 6 }] : [{ required: true, min: 6 }]}
                    >
                        <Input.Password />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

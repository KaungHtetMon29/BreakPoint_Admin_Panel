import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Button, Card, Form, Input, Popconfirm, Space, Spin, Typography, message } from "antd";
import { useApiUrl, useLogout } from "@refinedev/core";

type AdminProfile = {
    uuid: string;
    username: string;
    email: string;
    level: string;
    created_at: string;
};

type ProfileFormValues = {
    username: string;
    email: string;
};

type PasswordFormValues = {
    current_password: string;
    new_password: string;
    confirm_password: string;
};

export const AdminProfilePage = () => {
    const apiUrl = useApiUrl();
    const { mutate: logout } = useLogout();
    const [form] = Form.useForm<ProfileFormValues>();
    const [passwordForm] = Form.useForm<PasswordFormValues>();
    const [profile, setProfile] = useState<AdminProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    const getAuthHeader = () => {
        const token = localStorage.getItem("admin_access_token");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const fetchProfile = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/admin/profile`, {
                headers: getAuthHeader(),
            });
            const data = response.data as AdminProfile;
            setProfile(data);
            form.setFieldsValue({
                username: data.username,
                email: data.email,
            });
        } catch {
            message.error("Failed to load admin profile");
        } finally {
            setIsLoading(false);
        }
    }, [apiUrl, form]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const onUpdateProfile = async (values: ProfileFormValues) => {
        setIsSavingProfile(true);
        try {
            const response = await axios.patch(`${apiUrl}/admin/profile`, values, {
                headers: getAuthHeader(),
            });
            const data = response.data as AdminProfile;
            setProfile(data);
            form.setFieldsValue({
                username: data.username,
                email: data.email,
            });
            message.success("Profile updated");
        } catch {
            message.error("Failed to update profile");
        } finally {
            setIsSavingProfile(false);
        }
    };

    const onUpdatePassword = async (values: PasswordFormValues) => {
        setIsSavingPassword(true);
        try {
            await axios.put(
                `${apiUrl}/admin/profile/password`,
                {
                    current_password: values.current_password,
                    new_password: values.new_password,
                },
                {
                    headers: getAuthHeader(),
                },
            );
            passwordForm.resetFields();
            message.success("Password updated");
        } catch {
            message.error("Failed to update password");
        } finally {
            setIsSavingPassword(false);
        }
    };

    const onDeleteMyAccount = async () => {
        setIsDeletingAccount(true);
        try {
            await axios.delete(`${apiUrl}/admin/profile`, {
                headers: getAuthHeader(),
            });
            message.success("Account deleted");
            logout();
        } catch (error) {
            const serverMessage = axios.isAxiosError(error)
                ? (error.response?.data?.error as string | undefined)
                : undefined;
            message.error(serverMessage || "Failed to delete account");
        } finally {
            setIsDeletingAccount(false);
        }
    };

    if (isLoading) {
        return <Spin />;
    }

    return (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Card title="Admin Profile">
                <Space direction="vertical" size={8} style={{ marginBottom: 16 }}>
                    <Typography.Text strong>Admin Level: {profile?.level ?? "-"}</Typography.Text>
                    <Typography.Text type="secondary">Admin UUID: {profile?.uuid ?? "-"}</Typography.Text>
                </Space>
                <Form<ProfileFormValues> form={form} layout="vertical" onFinish={onUpdateProfile}>
                    <Form.Item name="username" label="Username" rules={[{ required: true, min: 3 }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
                        <Input />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" loading={isSavingProfile}>
                        Update Profile
                    </Button>
                </Form>
            </Card>
            <Card title="Change Password">
                <Form<PasswordFormValues> form={passwordForm} layout="vertical" onFinish={onUpdatePassword}>
                    <Form.Item name="current_password" label="Current Password" rules={[{ required: true, min: 6 }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item name="new_password" label="New Password" rules={[{ required: true, min: 6 }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        name="confirm_password"
                        label="Confirm New Password"
                        dependencies={["new_password"]}
                        rules={[
                            { required: true, min: 6 },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("new_password") === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error("Passwords do not match"));
                                },
                            }),
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Button type="primary" danger htmlType="submit" loading={isSavingPassword}>
                        Update Password
                    </Button>
                </Form>
            </Card>
            <Card title="Danger Zone">
                <Typography.Paragraph type="secondary">
                    This action permanently deletes your admin account.
                </Typography.Paragraph>
                <Popconfirm
                    title="Delete your account?"
                    description="This cannot be undone."
                    okText="Delete"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true, loading: isDeletingAccount }}
                    onConfirm={onDeleteMyAccount}
                >
                    <Button danger loading={isDeletingAccount}>
                        Delete My Account
                    </Button>
                </Popconfirm>
            </Card>
        </Space>
    );
};

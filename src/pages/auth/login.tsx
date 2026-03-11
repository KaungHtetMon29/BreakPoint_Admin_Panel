import { useLogin } from "@refinedev/core";
import { Button, Card, Form, Input, Typography, Alert } from "antd";

type LoginFormValues = {
    email: string;
    password: string;
};

export const LoginPage = () => {
    const { mutate: login, isPending, isError } = useLogin<LoginFormValues>();

    const handleSubmit = (values: LoginFormValues) => {
        login(values);
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <Card style={{ width: 420 }}>
                <Typography.Title level={3} style={{ marginBottom: 24 }}>
                    Admin Login
                </Typography.Title>
                {isError ? (
                    <Alert
                        style={{ marginBottom: 16 }}
                        type="error"
                        showIcon
                        message="Invalid email or password"
                    />
                ) : null}
                <Form<LoginFormValues> layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[{ required: true, type: "email", message: "Enter a valid email" }]}
                    >
                        <Input placeholder="admin@example.com" />
                    </Form.Item>
                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, min: 6, message: "Password must be at least 6 characters" }]}
                    >
                        <Input.Password placeholder="Enter password" />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" loading={isPending} block>
                        Sign In
                    </Button>
                </Form>
            </Card>
        </div>
    );
};

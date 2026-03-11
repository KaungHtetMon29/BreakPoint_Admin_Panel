
import { Refine, useGetIdentity, useLogout } from "@refinedev/core";
import routerProvider, {
  CatchAllNavigate,
  NavigateToResource,
} from "@refinedev/react-router";
import { dataProvider } from "./providers/data-provider";
import { ThemedLayout, ThemedSider, useNotificationProvider, RefineThemes } from "@refinedev/antd";
import type { RefineThemedLayoutSiderProps } from "@refinedev/antd";
import { Avatar, Button, ConfigProvider, Dropdown, App as AntdApp, Space, Typography } from "antd";
import type { MenuProps } from "antd";
import { DashboardOutlined, TeamOutlined, FileDoneOutlined, SafetyOutlined, LineChartOutlined, BarChartOutlined, DollarOutlined, MessageOutlined } from "@ant-design/icons";
import { BrowserRouter, Outlet, Routes, Route, Link, Navigate, useNavigate } from "react-router";
import { Authenticated } from "@refinedev/core";
import { UserList } from "./pages/users/list";
import { UserShow } from "./pages/users/show";
import { UserEdit } from "./pages/users/edit";
import { Dashboard } from "./pages/dashboard";
import { DailyActivityPage } from "./pages/analytics/daily-activity";
import { MonthlyQuotaPage } from "./pages/analytics/monthly-quota";
import { MonthlyRevenuePage } from "./pages/analytics/monthly-revenue";
import { ConsentList } from "./pages/consents/list";
import { FeedbackList } from "./pages/feedbacks/list";
import { LoginPage } from "./pages/auth/login";
import { AdminProfilePage } from "./pages/profile";
import { AdminManagementPage } from "./pages/admins";
import { authProvider } from "./providers/auth-provider";
import { colors } from "./theme/colors";
import "@refinedev/antd/dist/reset.css";

const API_URL = String(import.meta.env.VITE_API_URL ?? "/api").trim().replace(/\/+$/, "");
const ROUTER_BASENAME =
  window.location.pathname === "/admin" || window.location.pathname.startsWith("/admin/")
    ? "/admin"
    : "/";

const AdminSider = (props: RefineThemedLayoutSiderProps) => {
  return (
    <ThemedSider
      {...props}
      render={({ items, logout }) => (
        <div className="admin-sider-custom" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <style>
            {`
              .admin-sider-custom .ant-menu-item .ant-menu-item-icon,
              .admin-sider-custom .ant-menu-item .ant-menu-title-content,
              .admin-sider-custom .ant-menu-item .ant-menu-title-content a {
                color: #cfd3da !important;
              }
              .admin-sider-custom .ant-menu-item-selected {
                background: #f58220 !important;
                border-left: 3px solid #ffb06a !important;
                box-shadow: 0 6px 16px rgba(245, 130, 32, 0.35) !important;
                font-weight: 600 !important;
              }
              .admin-sider-custom .ant-menu-item-selected .ant-menu-item-icon,
              .admin-sider-custom .ant-menu-item-selected .ant-menu-title-content,
              .admin-sider-custom .ant-menu-item-selected .ant-menu-title-content a {
                color: #1a1a1a !important;
              }
            `}
          </style>
          <div style={{ paddingInline: 6, paddingTop: 8 }}>{items}</div>
          <div style={{ marginTop: "auto", paddingInline: 6, paddingTop: 14 }}>{logout}</div>
        </div>
      )}
    />
  );
};

type AdminIdentity = {
  id?: string;
  name?: string;
  email?: string;
  level?: string;
};

const getCurrentAdminLevel = () => {
  const token = localStorage.getItem("admin_access_token");
  if (!token) {
    return "";
  }
  try {
    const payloadSegment = token.split(".")[1];
    if (!payloadSegment) {
      return "";
    }
    const normalized = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = atob(padded);
    const payload = JSON.parse(decoded) as Record<string, unknown>;
    return String(payload.level ?? "").trim().toLowerCase();
  } catch {
    return "";
  }
};

const AdminHeader = () => {
  const navigate = useNavigate();
  const { data: identity } = useGetIdentity<AdminIdentity>();
  const { mutate: logout } = useLogout();

  const items: MenuProps["items"] = [
    {
      key: "profile",
      label: <Link to="/profile">Profile Settings</Link>,
    },
    {
      key: "logout",
      label: "Logout",
      danger: true,
      onClick: () => logout(),
    },
  ];

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", minHeight: 52, paddingInline: 20 }}>
      <Button type="text" style={{ color: colors.textPrimary, fontWeight: 600 }} onClick={() => navigate("/dashboard")}>
        Breakpoint Admin Panel
      </Button>
      <Dropdown menu={{ items }} placement="bottomRight" trigger={["click"]}>
        <Button type="text" style={{ height: "auto", color: colors.textPrimary, marginRight: 4 }}>
          <Space size={10}>
            <Avatar style={{ backgroundColor: colors.primary, color: colors.white }}>
              {identity?.name?.[0]?.toUpperCase() || "A"}
            </Avatar>
            <Space direction="vertical" size={0}>
              <Typography.Text style={{ color: colors.textPrimary, lineHeight: "16px" }}>
                {identity?.name || "Admin"}
              </Typography.Text>
              <Typography.Text style={{ color: colors.textSecondary, lineHeight: "14px", fontSize: 12 }}>
                {identity?.level || "admin"}
              </Typography.Text>
            </Space>
          </Space>
        </Button>
      </Dropdown>
    </div>
  );
};

function App() {
  const isSuperAdmin = getCurrentAdminLevel() === "super_admin";
  return (
    <BrowserRouter basename={ROUTER_BASENAME}>
      <ConfigProvider
        theme={{
          ...RefineThemes.Blue,
          token: {
            ...RefineThemes.Blue.token,
            colorPrimary: colors.primary,
            colorInfo: colors.info,
            colorSuccess: colors.success,
            colorWarning: colors.warning,
            colorError: colors.error,
            colorBgBase: colors.background,
            colorTextBase: colors.textPrimary,
            colorTextSecondary: colors.textSecondary,
            colorBorder: colors.backgroundLighter,
          },
          components: {
            Select: {
              optionActiveBg: colors.backgroundLighter,
              optionSelectedBg: colors.backgroundLighter,
              optionSelectedColor: colors.textPrimary,
              selectorBg: colors.backgroundLight,
              colorTextPlaceholder: colors.textMuted,
            },
            Pagination: {
              itemBg: colors.backgroundLight,
              itemActiveBg: colors.backgroundLighter,
              itemInputBg: colors.backgroundLight,
              colorText: colors.textPrimary,
            },
          },
        }}
      >
        <AntdApp>
          <Refine
            dataProvider={dataProvider(API_URL)}
            routerProvider={routerProvider}
            notificationProvider={useNotificationProvider}
            authProvider={authProvider}
            options={{
              title: {
                text: "Breakpoint Admin Panel",
              },
            }}
            resources={[
              {
                name: "dashboard",
                list: "/dashboard",
                meta: {
                    label: "Dashboard",
                    icon: <DashboardOutlined />,
                }
              },
              {
                name: "admin/analytics/daily-active-users",
                list: "/daily-activity",
                meta: {
                  label: "Daily Activity",
                  icon: <LineChartOutlined />,
                }
              },
              {
                name: "admin/analytics/monthly-quota-utilization",
                list: "/monthly-quota",
                meta: {
                  label: "Monthly Quota",
                  icon: <BarChartOutlined />,
                },
              },
              {
                name: "admin/analytics/monthly-revenue",
                list: "/monthly-revenue",
                meta: {
                  label: "Monthly Revenue",
                  icon: <DollarOutlined />,
                },
              },
              {
                name: "admin/users",
                list: "/users",
                show: "/users/show/:id",
                edit: "/users/edit/:id",
                meta: {
                    label: "Users",
                    icon: <TeamOutlined />,
                },
              },
              {
                name: "admin/consents/accepted",
                list: "/consents",
                meta: {
                  label: "Consents",
                  icon: <FileDoneOutlined />,
                },
              },
              {
                name: "admin/feedbacks",
                list: "/feedbacks",
                meta: {
                  label: "Feedbacks",
                  icon: <MessageOutlined />,
                },
              },
              ...(isSuperAdmin
                ? [
                    {
                      name: "admin/admins",
                      list: "/admins",
                      meta: {
                        label: "Admins",
                        icon: <SafetyOutlined />,
                      },
                    },
                  ]
                : []),
              {
                name: "admin/profile",
                list: "/profile",
                meta: {
                  hide: true,
                },
              },
              {
                name: "admin/usage",
                list: "/usage",
                meta: {
                  hide: true,
                },
              },
              {
                name: "admin/analytics/plan-expiry-risk",
                list: "/analytics/plan-expiry-risk",
                meta: {
                  hide: true,
                },
              },
            ]}
          >
            <Routes>
              <Route
                path="/login"
                element={
                  <Authenticated key="login-authenticated" fallback={<LoginPage />}>
                    <NavigateToResource resource="dashboard" />
                  </Authenticated>
                }
              />
              <Route
                element={
                  <Authenticated key="private-authenticated" fallback={<CatchAllNavigate to="/login" />}>
                    <ThemedLayout Sider={AdminSider} Header={AdminHeader}>
                      <Outlet />
                    </ThemedLayout>
                  </Authenticated>
                }
              >
                <Route
                  index
                  element={<NavigateToResource resource="dashboard" />}
                />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/daily-activity" element={<DailyActivityPage />} />
                <Route path="/monthly-quota" element={<MonthlyQuotaPage />} />
                <Route path="/monthly-revenue" element={<MonthlyRevenuePage />} />

                <Route path="/users">
                  <Route index element={<UserList />} />
                  <Route path="show/:id" element={<UserShow />} />
                  <Route path="edit/:id" element={<UserEdit />} />
                </Route>
                <Route path="/consents" element={<ConsentList />} />
                <Route path="/feedbacks" element={<FeedbackList />} />
                <Route path="/admins" element={isSuperAdmin ? <AdminManagementPage /> : <Navigate to="/dashboard" replace />} />
                <Route path="/profile" element={<AdminProfilePage />} />
              </Route>
            </Routes>
          </Refine>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
}

export default App;

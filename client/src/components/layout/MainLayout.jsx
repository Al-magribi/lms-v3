import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import {
  Button,
  Drawer,
  Flex,
  Layout,
  Menu,
  Spin,
  Typography,
  message,
} from "antd";
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../../service/api/auth/ApiAuth";
import { setLogout } from "../../service/slice/AuthSlice";
import { getMenusByLevel } from "./Menus";

const { Header, Footer, Sider, Content } = Layout;
const { Title } = Typography;

const LayoutConfigContext = createContext(null);

const MainLayoutShell = ({ children, levels = [], title = "", root = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [routeConfig, setRouteConfig] = useState({ levels, title });
  const effectiveLevels = root ? routeConfig.levels : levels;
  const effectiveTitle = root ? routeConfig.title : title;

  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    const savedCollapsed = localStorage.getItem("collapsed");
    return savedCollapsed !== null ? JSON.parse(savedCollapsed) : false;
  });

  const { user } = useSelector((state) => state.auth);
  const isSignin = localStorage.getItem("isSignin");

  const [logout, { isLoading, isSuccess, isError, data, error }] =
    useLogoutMutation();

  const providerValue = useMemo(
    () => ({
      isRootLayout: true,
      setConfig: setRouteConfig,
    }),
    []
  );

  const { mainMenuItems, secondaryMenuItems } = useMemo(
    () => getMenusByLevel(user),
    [user]
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCollapsedChange = (value) => {
    setCollapsed(value);
    localStorage.setItem("collapsed", JSON.stringify(value));
  };

  const handleMenuClick = useCallback(
    ({ key }) => {
      if (isMobile) {
        setDrawerVisible(false);
      }

      if (key === "logout") {
        logout();
      } else {
        navigate(key);
      }
    },
    [isMobile, logout, navigate]
  );

  useEffect(() => {
    if (root && (!effectiveLevels || effectiveLevels.length === 0)) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      if (!user || !isSignin || !effectiveLevels?.includes(user?.level)) {
        window.location.href = "/";
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [effectiveLevels, isSignin, root, user]);

  useEffect(() => {
    if (isSuccess) {
      localStorage.removeItem("isSignin");
      localStorage.removeItem("collapsed");
      dispatch(setLogout());
      message.success(data.message);
      window.location.href = "/";
    }

    if (isError) {
      message.error(error.data.message);
    }
  }, [data, dispatch, error, isError, isSuccess]);

  const sidebarContent = (
    <>
      {!drawerVisible && (
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            marginBottom: 16,
          }}
        >
          {collapsed && isMobile === false ? (
            <img src="logo.png" alt="logo" height={40} />
          ) : (
            <Flex align="center" gap={12}>
              <img src="logo.png" alt="logo" height={40} />
              <Title level={5} style={{ color: "#fff", margin: 0 }}>
                NURAIDA
              </Title>
            </Flex>
          )}
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 100px)",
          justifyContent: "space-between",
        }}
      >
        <Menu
          items={mainMenuItems}
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          theme="dark"
          mode="inline"
        />

        <Menu
          items={secondaryMenuItems}
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          theme="dark"
          mode="inline"
        />
      </div>
    </>
  );

  return (
    <LayoutConfigContext.Provider value={providerValue}>
      <Layout style={{ minHeight: "100vh" }}>
        <title>{effectiveTitle}</title>

        {!isMobile && (
          <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            style={{
              backgroundColor: "#001529",
              boxShadow: "2px 0 8px rgba(0,0,0,0.3)",
              position: "fixed",
              left: 0,
              top: 0,
              bottom: 0,
              zIndex: 1000,
              color: "#fff",
            }}
          >
            {sidebarContent}
          </Sider>
        )}

        {isMobile && (
          <Drawer
            placement="left"
            title="NIBS"
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            style={{ padding: 0, backgroundColor: "#001529", color: "#fff" }}
            width={200}
          >
            {sidebarContent}
          </Drawer>
        )}

        <Layout
          style={{
            marginLeft: isMobile ? 0 : collapsed ? 80 : 200,
            transition: "margin-left 0.2s",
          }}
        >
          <Header
            style={{
              backgroundColor: "#001529",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              height: "64px",
              position: "fixed",
              top: 0,
              right: 0,
              left: isMobile ? 0 : collapsed ? 80 : 200,
              zIndex: 999,
              transition: "left 0.2s",
              padding: "0 24px",
            }}
          >
            <Button
              type="default"
              icon={
                isMobile ? (
                  <MenuOutlined />
                ) : collapsed ? (
                  <MenuUnfoldOutlined />
                ) : (
                  <MenuFoldOutlined />
                )
              }
              onClick={() =>
                isMobile
                  ? setDrawerVisible(!drawerVisible)
                  : handleCollapsedChange(!collapsed)
              }
            />

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontWeight: "600",
                    fontSize: "14px",
                    color: "white",
                    lineHeight: "1.2",
                  }}
                >
                  {user?.name}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.7)",
                    lineHeight: "1.2",
                  }}
                >
                  {user?.level}
                </div>
              </div>
            </div>
          </Header>

          <Content
            style={{
              margin: "74px 10px 10px 10px",
              padding: "24px",
              borderRadius: 8,
              background: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              minHeight: "calc(100vh - 180px)",
              overflow: "auto",
            }}
          >
            <Spin spinning={isLoading} tip="Loading...">
              {children ?? <Outlet />}
            </Spin>
          </Content>

          <Footer style={{ textAlign: "center", background: "#fafafa" }}>
            <span>&copy; {new Date().getFullYear()}</span> NIBS
          </Footer>
        </Layout>
      </Layout>
    </LayoutConfigContext.Provider>
  );
};

const LayoutBridge = ({ children, levels = [], title = "", setConfig }) => {
  useEffect(() => {
    setConfig({ levels, title });
  }, [levels, setConfig, title]);

  return children ?? <Outlet />;
};

const MainLayout = (props) => {
  const parentLayout = useContext(LayoutConfigContext);

  if (!props.root && parentLayout?.isRootLayout) {
    return (
      <LayoutBridge
        levels={props.levels}
        title={props.title}
        setConfig={parentLayout.setConfig}
      >
        {props.children}
      </LayoutBridge>
    );
  }

  return <MainLayoutShell {...props} />;
};

export default memo(MainLayout);

import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MenuOutlined, // Impor ikon baru untuk mobile
} from "@ant-design/icons";
import {
  Button,
  Drawer, // Impor komponen Drawer
  Flex,
  Layout,
  Menu,
  Spin,
  Typography,
  message,
} from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AdminMenus,
  CenterMenus,
  ParentMenus,
  StudentMenus,
  TahfizMenus,
  TeacherMenus,
} from "./Menus";
import { useLocation, useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../../service/api/auth/ApiAuth";
import { setLogout } from "../../service/slice/AuthSlice";

const { Header, Footer, Sider, Content } = Layout;
const { Title } = Typography;

const MainLayout = ({ children, levels, title }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State untuk mode mobile dan visibilitas drawer
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

  // Efek untuk mendeteksi perubahan ukuran layar
  useEffect(() => {
    const handleResize = () => {
      // Ant Design's 'lg' breakpoint is 992px
      setIsMobile(window.innerWidth < 992);
    };

    handleResize(); // Panggil saat pertama kali render
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCollapsedChange = (value) => {
    setCollapsed(value);
    localStorage.setItem("collapsed", JSON.stringify(value));
  };

  const handleMenuClick = ({ key }) => {
    if (isMobile) {
      setDrawerVisible(false); // Tutup drawer saat menu diklik di mobile
    }

    if (key === "logout") {
      logout();
    } else {
      navigate(key);
    }
  };

  let mainMenuItems = [];
  let secondaryMenuItems = [];

  switch (user?.level) {
    case "center":
      mainMenuItems = CenterMenus.slice(0, 4);
      secondaryMenuItems = CenterMenus.slice(4);
      break;
    case "admin":
      mainMenuItems = AdminMenus.slice(0, 6);
      secondaryMenuItems = AdminMenus.slice(6);
      break;
    case "teacher":
      if (user?.homeroom) {
        mainMenuItems = TeacherMenus.slice(0, 4);
        secondaryMenuItems = TeacherMenus.slice(4);
      } else {
        mainMenuItems = TeacherMenus.slice(0, 3);
        secondaryMenuItems = TeacherMenus.slice(4);
      }
      break;
    case "student":
      mainMenuItems = StudentMenus.slice(0, 5);
      secondaryMenuItems = StudentMenus.slice(5);
      break;
    case "parent":
      mainMenuItems = ParentMenus.slice(0, 4);
      secondaryMenuItems = ParentMenus.slice(4);
      break;
    case "tahfiz":
      mainMenuItems = TahfizMenus.slice(0, 4);
      secondaryMenuItems = TahfizMenus.slice(4);
      break;
    default:
      mainMenuItems = [];
      secondaryMenuItems = [];
  }

  // Otorisasi dan redirect
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!user || !isSignin || !levels.includes(user?.level)) {
        window.location.href = "/";
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [user, isSignin, levels]);

  // Handle logout
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
  }, [isSuccess, isError, data, error, dispatch]);

  // Ekstrak konten sidebar agar bisa digunakan di Sider dan Drawer
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
    <Layout style={{ minHeight: "100vh" }}>
      <title>{title}</title>

      {/* Tampilkan Sider hanya di desktop */}
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

      {/* Tampilkan Drawer hanya di mobile */}
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
          // Sesuaikan margin berdasarkan mode (mobile/desktop)
          marginLeft: isMobile ? 0 : collapsed ? 80 : 200,
          transition: "margin-left 0.2s",
        }}
      >
        {/* Header */}
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
            // Sesuaikan posisi kiri berdasarkan mode
            left: isMobile ? 0 : collapsed ? 80 : 200,
            zIndex: 999,
            transition: "left 0.2s",
            padding: "0 24px",
          }}
        >
          <Button
            type="default"
            // Ganti ikon dan fungsi onClick berdasarkan mode
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

        {/* Content */}
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
            {children}
          </Spin>
        </Content>

        {/* Footer */}
        <Footer style={{ textAlign: "center", background: "#fafafa" }}>
          <span>&copy; {new Date().getFullYear()}</span> NIBS
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;

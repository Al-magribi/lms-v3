import {
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  Row,
  Space,
  Typography,
  message,
} from "antd";
import "./Login.css";
import { roleList } from "./RoleList.jsx";
import { cloneElement, useEffect, useState } from "react";
import {
  EmailIcon,
  StudentIcon,
  TeacherIcon,
} from "../../components/icons/Icons.jsx";
import {
  ArrowLeftOutlined,
  LockOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import { useSigninMutation } from "../../service/api/auth/ApiAuth.js";
import LoadingData from "../../components/loaders/LoadingData.jsx";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const routes = {
  center: "/center-dashboard",
  admin: "/admin-dashboard",
  student: "/siswa-dashboard",
  teacher: "/guru-dashboard",
  parent: "/orangtua-dashboard",
  tahfiz: "/tahfiz-dashboard",
  cms: "/cms-dashboard",
};

const Login = () => {
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const [role, setRole] = useState("none");
  const [messageApi, contextHolder] = message.useMessage();

  const [form] = Form.useForm();

  const [signin, { isLoading, isSuccess, error, data }] = useSigninMutation();

  const handleRole = (value) => {
    setRole(value);
    form.resetFields();
  };

  const handleReset = () => {
    setRole("none");
    form.resetFields();
  };

  const handleSubmit = (value) => {
    const trimmedValues = {
      ...value,
      username: value.username?.trim(),
      email: value.email?.trim(),
      nis: value.nis?.trim(),
      password: value.password?.trim(),
    };
    signin(trimmedValues);
  };

  useEffect(() => {
    if (user?.level) {
      const targetRoute = routes[user.level];
      if (targetRoute) {
        navigate(targetRoute, { replace: true });
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    if (isSuccess) {
      messageApi.open({
        type: "success",
        content: data.message,
      });
      form.resetFields();
      localStorage.setItem("isSignin", true);
      window.location.href = routes[data.user.level] || "/";
    }

    if (error) {
      messageApi.open({
        type: "error",
        content: error.data.message,
      });
    }
  }, [data, isSuccess, error]);

  return (
    <LoadingData isLoading={isLoading}>
      <title>NIBS LOGIN</title>
      {contextHolder}
      <div className="area">
        <ul className="circles">
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </div>
      <Flex
        vertical
        align="center"
        justify="center"
        gap={12}
        style={{ height: "100vh" }}
      >
        <img
          src="/logo.png"
          alt="logo"
          style={{ height: 120, width: 120, marginBottom: "1rem" }}
          className="pointer"
          onClick={() => (window.location.href = "/")}
        />

        {role === "none" && (
          <Row
            gutter={[16, 16]}
            justify="center"
            style={{ width: "80%", maxWidth: 600 }}
          >
            {roleList.map((r) => (
              <Col xs={12} md={6} key={r.label}>
                <Flex
                  vertical
                  gap={8}
                  justify="center"
                  align="center"
                  style={{
                    borderRadius: 8,
                    backgroundColor: "#fff",
                    padding: "1rem 2rem",
                    color: "#4e54c8",
                    cursor: "pointer",
                  }}
                  className="transition-card"
                  onClick={() => handleRole(r.value)}
                >
                  <Flex
                    align="center"
                    justify="center"
                    className="transition-icon"
                  >
                    {cloneElement(r.icon, { width: 40, height: 40 })}
                  </Flex>
                  <Typography.Title
                    level={5}
                    style={{ margin: 0, color: "#4e54c8" }}
                  >
                    {r.label.toUpperCase()}
                  </Typography.Title>
                </Flex>
              </Col>
            ))}
          </Row>
        )}

        {role !== "none" && (
          <Form form={form} onFinish={handleSubmit}>
            <Form.Item
              name={
                role === "student"
                  ? "nis"
                  : role === "teacher"
                  ? "username"
                  : "email"
              }
              rules={[{ required: true, message: "Masukan Email!" }]}
            >
              <Input
                size="large"
                placeholder={
                  role === "student"
                    ? "NIS"
                    : role === "teacher"
                    ? "Username"
                    : "Email"
                }
                prefix={
                  role === "student" ? (
                    <Flex align="center" justify="center">
                      {StudentIcon}
                    </Flex>
                  ) : role === "teacher" ? (
                    <Flex align="center" justify="center">
                      {TeacherIcon}
                    </Flex>
                  ) : (
                    <Flex align="center" justify="center">
                      {EmailIcon}
                    </Flex>
                  )
                }
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Masukan Password!" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                size="large"
                placeholder="Password"
              />
            </Form.Item>

            <Form.Item>
              <Flex align="center" justify="space-between">
                <Button
                  icon={<ArrowLeftOutlined />}
                  variant="solid"
                  color="danger"
                  onClick={handleReset}
                >
                  Kembali
                </Button>

                <Button
                  icon={<LoginOutlined />}
                  className="btn-allow"
                  htmlType="submit"
                >
                  Masuk
                </Button>
              </Flex>
            </Form.Item>
          </Form>
        )}
      </Flex>
    </LoadingData>
  );
};

export default Login;

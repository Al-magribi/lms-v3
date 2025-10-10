import React, { useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Avatar,
  Typography,
  Descriptions,
  Form,
  Input,
  Button,
  message,
  Tabs,
  Tag,
  Divider,
  Flex,
} from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import MainLayout from "../layout/MainLayout";
import {
  useUpdateAdminProfileMutation,
  useUpdateTeacherProfileMutation,
  useUpdateStudentProfileMutation,
  useUpdateParentProfileMutation,
} from "../../service/api/auth/ApiAuth"; // Assuming ApiAuth.js is in the same folder

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Profile = () => {
  const { user } = useSelector((state) => state.auth);

  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // RTK Query Mutation Hooks
  const [updateAdminProfile, { isLoading: isAdminLoading }] =
    useUpdateAdminProfileMutation();
  const [updateTeacherProfile, { isLoading: isTeacherLoading }] =
    useUpdateTeacherProfileMutation();
  const [updateStudentProfile, { isLoading: isStudentLoading }] =
    useUpdateStudentProfileMutation();
  const [updateParentProfile, { isLoading: isParentLoading }] =
    useUpdateParentProfileMutation();

  // Combine loading states from all possible mutations
  const isLoading =
    isAdminLoading || isTeacherLoading || isStudentLoading || isParentLoading;

  // Set initial form values when user data is available
  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone,
      });
    }
  }, [user, profileForm]);

  const handleProfileUpdate = async (values) => {
    let updateMutation;

    // Select the correct mutation based on user level
    switch (user?.level) {
      case "admin":
      case "tahfiz":
      case "cms":
      case "center":
        updateMutation = updateAdminProfile;
        break;
      case "teacher":
        updateMutation = updateTeacherProfile;
        break;
      case "student":
        updateMutation = updateStudentProfile;
        break;
      case "parent":
        updateMutation = updateParentProfile;
        break;
      default:
        message.error("Invalid user role for profile update.");
        return;
    }

    try {
      const response = await updateMutation(values).unwrap();
      message.success(response.message || "Profile updated successfully!");
      // No need to manually refetch user data; RTK Query's tag invalidation handles it
    } catch (error) {
      message.error(error.data?.message || "An error occurred while updating.");
    }
  };

  const handlePasswordChange = async (values) => {
    let updateMutation;
    // Select the correct mutation based on user level
    switch (user?.level) {
      case "admin":
      case "tahfiz":
      case "cms":
      case "center":
        updateMutation = updateAdminProfile;
        break;
      case "teacher":
        updateMutation = updateTeacherProfile;
        break;
      case "student":
        updateMutation = updateStudentProfile;
        break;
      case "parent":
        updateMutation = updateParentProfile;
        break;
      default:
        message.error("Invalid user role for password change.");
        return;
    }

    // The backend expects the new password along with other profile data
    const payload = {
      ...profileForm.getFieldsValue(),
      newPassword: values.newPassword,
      oldPassword: values.oldPassword,
    };

    try {
      const response = await updateMutation(payload).unwrap();
      message.success(response.message || "Password changed successfully!");
      passwordForm.resetFields();
    } catch (error) {
      message.error(
        error.data?.message || "An error occurred while changing password."
      );
    }
  };

  // Dynamically render user details based on their level
  const renderUserDetails = () => {
    if (!user) return null;

    const items = [
      { key: "email", label: "Email", children: user.email },
      user.phone && { key: "phone", label: "Phone", children: user.phone },
      user.homebase && {
        key: "homebase",
        label: "Homebase",
        children: user.homebase,
      },
    ];

    switch (user.level) {
      case "student":
        items.push(
          { key: "nis", label: "NIS", children: user.nis },
          { key: "grade", label: "Grade", children: user.grade },
          { key: "class", label: "Class", children: user.class }
        );
        break;
      case "teacher":
        items.push(
          { key: "nip", label: "NIP", children: user.nip },
          {
            key: "homeroom",
            label: "Homeroom",
            children: user.homeroom ? user.class : "N/A",
          },
          {
            key: "subjects",
            label: "Subjects",
            children:
              user.subjects?.length > 0
                ? user.subjects.map((s) => <Tag key={s.id}>{s.name}</Tag>)
                : "No subjects assigned",
          }
        );
        break;
      case "parent":
        items.push(
          {
            key: "student_name",
            label: "Student Name",
            children: user.student,
            span: 2,
          },
          { key: "student_nis", label: "Student NIS", children: user.nis },
          { key: "student_grade", label: "Grade", children: user.grade },
          { key: "student_class", label: "Class", children: user.class }
        );
        break;
      default: // Admin and other roles
        break;
    }

    return <Descriptions bordered column={1} items={items.filter(Boolean)} />;
  };

  return (
    <MainLayout
      title={`Profile`}
      levels={[
        "admin",
        "teacher",
        "parent",
        "student",
        "tahfiz",
        "cms",
        "center",
      ]}
    >
      <Row gutter={[24, 24]}>
        {/* Profile Display Column */}
        <Col xs={24} md={10} lg={8}>
          <Card>
            <Flex vertical align="center">
              <Avatar size={128} icon={<UserOutlined />} src={user?.img} />
              <Title level={5} style={{ marginTop: 16, marginBottom: 0 }}>
                {user?.name}
              </Title>
              <Text type="secondary" style={{ textTransform: "capitalize" }}>
                {user?.level}
              </Text>
            </Flex>
            <Divider />
            {renderUserDetails()}
          </Card>
        </Col>

        {/* Profile Update Column */}
        <Col xs={24} md={14} lg={16}>
          <Card>
            <Tabs defaultActiveKey="1">
              <TabPane tab="Update Information" key="1">
                <Form
                  form={profileForm}
                  layout="vertical"
                  onFinish={handleProfileUpdate}
                  initialValues={{
                    name: user?.name,
                    email: user?.email,
                    phone: user?.phone,
                  }}
                >
                  <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[
                      { required: true, message: "Please input your name!" },
                    ]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Full Name" />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    label="Email Address"
                    rules={[
                      {
                        required: true,
                        type: "email",
                        message: "Please input a valid email!",
                      },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined />}
                      placeholder="Email Address"
                    />
                  </Form.Item>
                  {user?.level !== "parent" && (
                    <Form.Item name="phone" label="Phone Number">
                      <Input
                        prefix={<PhoneOutlined />}
                        placeholder="Phone Number"
                      />
                    </Form.Item>
                  )}
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isLoading}
                    >
                      Save Changes
                    </Button>
                  </Form.Item>
                </Form>
              </TabPane>
              <TabPane tab="Change Password" key="2">
                <Form
                  form={passwordForm}
                  layout="vertical"
                  onFinish={handlePasswordChange}
                >
                  <Form.Item
                    name="oldPassword"
                    label="Old Password"
                    rules={[
                      {
                        required: true,
                        message: "Please input your old password!",
                      },
                    ]}
                  >
                    <Input.Password placeholder="Old Password" />
                  </Form.Item>
                  <Form.Item
                    name="newPassword"
                    label="New Password"
                    rules={[
                      {
                        required: true,
                        message: "Please input your new password!",
                      },
                    ]}
                    hasFeedback
                  >
                    <Input.Password placeholder="New Password" />
                  </Form.Item>
                  <Form.Item
                    name="confirmPassword"
                    label="Confirm New Password"
                    dependencies={["newPassword"]}
                    hasFeedback
                    rules={[
                      {
                        required: true,
                        message: "Please confirm your new password!",
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (
                            !value ||
                            getFieldValue("newPassword") === value
                          ) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error(
                              "The two passwords that you entered do not match!"
                            )
                          );
                        },
                      }),
                    ]}
                  >
                    <Input.Password placeholder="Confirm New Password" />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isLoading}
                    >
                      Update Password
                    </Button>
                  </Form.Item>
                </Form>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </MainLayout>
  );
};

export default Profile;

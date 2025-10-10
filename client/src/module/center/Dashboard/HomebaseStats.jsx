import React, { Fragment } from "react";
import { useGetHomebaseStatsQuery } from "../../../service/api/dashboard/ApiDashboard";
import LoadingData from "../../../components/loaders/LoadingData";
import { Card, Row, Col, Statistic, Divider, Space, Flex } from "antd"; // Import Row and Col
import {
  ClassIcon,
  FemaleIcon,
  MaleIcon,
  StudentIcon,
  TagIcon,
  TeacherIcon,
} from "../../../components/icons/Icons";

const HomebaseStats = () => {
  const { data, isLoading } = useGetHomebaseStatsQuery();

  console.log(data);

  return (
    <LoadingData isLoading={isLoading}>
      {data?.map((item, i) => (
        <Card
          key={i}
          title={item.homebase_name}
          style={{ marginBottom: "20px" }}
        >
          <Row gutter={[16, 16]}>
            {/* Add gutter for spacing between columns */}
            <Col xs={24} sm={12} md={6}>
              {/* Full width on extra small screens, 2 items per row on small screens, and 4 on medium */}
              <Card hoverable style={{ backgroundColor: "#F5F5DC" }}>
                <Statistic
                  title={"Guru"}
                  value={item.total_teachers}
                  prefix={<span>{TeacherIcon}</span>}
                  valueStyle={{ color: "#4B0082" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card hoverable style={{ backgroundColor: "#E0F7FA" }}>
                <Statistic
                  title={"Siswa"}
                  value={item.total_students}
                  prefix={<span>{StudentIcon}</span>}
                  valueStyle={{ color: "#006064" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card hoverable style={{ backgroundColor: "#FFF0F5" }}>
                <Statistic
                  title={"Kelas"}
                  value={item.total_classes}
                  prefix={<span>{ClassIcon}</span>}
                  valueStyle={{ color: "#8B0000" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card hoverable style={{ backgroundColor: "#F0FFF0" }}>
                <Statistic
                  title={"Pelajaran"}
                  value={item.total_subjects}
                  prefix={<span>{TagIcon}</span>}
                  valueStyle={{ color: "#228B22" }}
                />
              </Card>
            </Col>
          </Row>

          <Divider>Satistik</Divider>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={16}>
              <Card title="Komposisi Siswa">
                <Row gutter={[16, 16]}>
                  {item.students_stats?.map((stat, i) => (
                    <Col key={i} sx={24} sm={8}>
                      <Card hoverable title={`Tingkat ${stat.grade_name}`}>
                        <Flex justify="space-between">
                          <Statistic
                            title={"Ikhwan"}
                            value={stat.male_count}
                            prefix={<span>{MaleIcon}</span>}
                          />
                          <Statistic
                            title={"Akhwat"}
                            value={stat.female_count}
                            prefix={<span>{FemaleIcon}</span>}
                          />
                        </Flex>
                      </Card>

                      <Divider>Data Kelas</Divider>

                      <Flex vertical gap="small">
                        {stat.class_stats.map((c, i) => (
                          <Fragment key={i}>
                            <Card
                              hoverable
                              style={{
                                backgroundColor: "#F7FFF0",
                              }}
                            >
                              <Statistic
                                title={c.class_name}
                                value={c.students_count}
                                valueStyle={{ color: "#335500" }}
                              />
                            </Card>

                            <Card hoverable title="Komposisi Kelas">
                              <Flex justify="space-between">
                                <Statistic
                                  title="Ikhwan"
                                  value={c.male_count}
                                  prefix={<span>{MaleIcon}</span>}
                                />
                                <Statistic
                                  title="Akhwat"
                                  value={c.female_count}
                                  prefix={<span>{FemaleIcon}</span>}
                                />
                              </Flex>
                            </Card>
                          </Fragment>
                        ))}
                      </Flex>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card title="Komposisi Guru">
                <Card
                  hoverable
                  style={{ marginBottom: "16px", backgroundColor: "#FFFAF0" }}
                >
                  <Statistic
                    title="Ikhwan"
                    value={item.teacher_stats?.male_count}
                    prefix={<span>{MaleIcon}</span>}
                    valueStyle={{ color: "#2F4F4F" }}
                  />
                </Card>

                <Card hoverable style={{ backgroundColor: "#FFF5EE" }}>
                  <Statistic
                    title="Akhwat"
                    value={item.teacher_stats?.female_count}
                    prefix={<span>{FemaleIcon}</span>}
                    valueStyle={{ color: "#A0522D" }}
                  />
                </Card>
              </Card>
            </Col>
          </Row>
        </Card>
      ))}
    </LoadingData>
  );
};

export default HomebaseStats;

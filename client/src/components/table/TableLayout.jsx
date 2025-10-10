import { Flex, Input, Spin, Table } from "antd";
import React from "react";

const { Search } = Input;

const TableLayout = ({
  onSearch,
  isLoading,
  columns,
  source,
  rowKey,
  page,
  limit,
  totalData,
  onChange,
  tableRef,
}) => {
  return (
    <div ref={tableRef}>
      <Flex vertical gap={"middle"}>
        <Search
          placeholder="Cari data..."
          allowClear
          enterButton="Cari"
          onSearch={onSearch}
          style={{ width: 300 }}
        />

        <Spin tip="Memuat data..." spinning={isLoading}>
          <Table
            columns={columns}
            dataSource={source}
            rowKey={rowKey}
            pagination={{
              size: "small",
              current: page,
              pageSize: limit,
              total: totalData,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} dari ${total}`,
            }}
            onChange={onChange}
            scroll={{ x: "max-content" }}
          />
        </Spin>
      </Flex>
    </div>
  );
};

export default TableLayout;

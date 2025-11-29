import React, { useEffect, useState } from "react";
import { Table, Spin } from "antd";
import axios from "axios";

const TablePage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 컬럼 정의
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
  ];

  // 데이터 조회
  useEffect(() => {
    axios
      .get("/api/users") // Vite dev server proxy가 Spring Boot로 연결된 경우
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      {loading ? <Spin size="large" /> : <Table dataSource={data} columns={columns} rowKey="id" />}
    </div>
  );
};

export default TablePage;
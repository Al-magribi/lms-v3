import { CloseOutlined } from "@ant-design/icons";
import { Button } from "antd";

const Cancel = ({ disabled, onClick }) => {
  return (
    <Button
      icon={<CloseOutlined />}
      color="danger"
      variant="solid"
      onClick={onClick}
      disabled={disabled}
    >
      Cancel
    </Button>
  );
};

export default Cancel;

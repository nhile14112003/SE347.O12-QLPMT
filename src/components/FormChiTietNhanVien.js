import React, { useState, useEffect, useContext } from "react";
import api from "../api/Api";
import { AuthContext } from "../hook/AuthProvider";

export const FormChiTietNhanVien = ({
  closeModal,
  onSubmit,
  defaultValue,
  staffs,
}) => {
  const { user } = useContext(AuthContext);
  const [formState, setFormState] = useState(
    defaultValue || {
      maNhanVien: "",
      tenNhanVien: "",
      soDienThoai: "",
      chucVu: "Nha sĩ",
      email: "",
      luongCoBan: "",
      chiNhanh: "",
      bangCap: "",
      kinhNghiem: "",
    }
  );
  const [errors, setErrors] = useState("");
  const [branches, setBranches] = useState([]);
  const [positions, setPositions] = useState([
    "Nha sĩ",
    "Phụ tá",
    "Quản lý",
    "Tiếp tân",
  ]);
  useEffect(() => {
    getBranches();
  }, []);

  const getBranches = async () => {
    const branches = await api.getAllBranchs();
    setBranches(branches);
    if (!defaultValue) formState.chiNhanh = branches[0].tenChiNhanh;
  };
  const validateForm = () => {
    console.log(formState);
    if (
      formState.maNhanVien != "" &&
      formState.tenNhanVien != "" &&
      formState.soDienThoai != "" &&
      formState.chucVu != "" &&
      formState.email != "" &&
      formState.chiNhanh != ""
    ) {
      const isIdExists = staffs.some(
        (staff) => staff.maNhanVien == formState.maNhanVien
      );
      if (
        !defaultValue &&
        defaultValue.maNhanVien != formState.maNhanVien &&
        isIdExists
      ) {
        setErrors(
          "Mã nhân viên này đã tồn tại! Vui lòng nhập một mã nhân viên khác."
        );
        return false;
      } else {
        setErrors("");
        return true;
      }
    } else {
      let errorFields = [];
      for (const [key, value] of Object.entries(formState)) {
        if (value == "") {
          switch (key) {
            case "maNhanVien":
              errorFields.push("Mã nhân viên");
              break;
            case "tenNhanVien":
              errorFields.push("Tên nhân viên");
              break;
            case "soDienThoai":
              errorFields.push("Số điện thoại");
              break;
            case "email":
              errorFields.push("Email");
              break;
            case "luongCoBan":
              errorFields.push("Lương cơ bản");
              break;
            default:
              break;
          }
        }
      }
      setErrors("Vui lòng nhập: " + errorFields.join(", "));
      return false;
    }
  };

  const handleChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    onSubmit(formState);

    closeModal();
  };

  const isNumberPress = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 86) {
    } else {
      const validKeyForPayment = ["-", "."];
      if (validKeyForPayment.includes(e.key)) {
        e.preventDefault();
      }
    }
  };
  const isNumberCopy = (e) => {
    let data = e.clipboardData.getData("text");
    if (data.match(/[^\d]/)) {
      e.preventDefault();
    }
  };

  return (
    <div
      className="modal-container"
      onClick={(e) => {
        if (e.target.className === "modal-container") closeModal();
      }}
    >
      <div className="col-sm-4 modal1">
        <form style={{ overflow: "auto", height: "480px" }}>
          <div className="form-group">
            <label for="maNhanVien">Mã nhân viên</label>
            <input
              name="maNhanVien"
              type="text"
              onChange={handleChange}
              value={formState.maNhanVien}
            />
          </div>
          <div className="form-group">
            <label for="tenNhanVien">Họ và tên</label>
            <input
              name="tenNhanVien"
              type="text"
              onChange={handleChange}
              value={formState.tenNhanVien}
            />
          </div>
          <div className="form-group">
            <label for="soDienThoai">Số điện thoại</label>
            <input
              name="soDienThoai"
              onChange={handleChange}
              type="number"
              value={formState.soDienThoai}
              onKeyDown={isNumberPress}
              onPaste={isNumberCopy}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              name="email"
              onChange={handleChange}
              value={formState.email}
            />
          </div>
          <div className="form-group">
            <div className="form-group">
              <label for="chucVu">Chức vụ</label>
              <select
                name="chucVu"
                onChange={handleChange}
                value={formState.chucVu}
              >
                {positions.map((item, index) => (
                  <option key={index} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="bangCap">Bằng cấp</label>
            <input
              name="bangCap"
              onChange={handleChange}
              type="text"
              value={formState.bangCap}
            />
          </div>
          <div className="form-group">
            <label htmlFor="kinhNghiem">Kinh nghiệm</label>
            <textarea
              rows="3"
              name="kinhNghiem"
              value={formState.kinhNghiem}
              onChange={handleChange}
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="luongCoBan">Lương cơ bản/giờ</label>
            <input
              type="number"
              name="luongCoBan"
              onChange={handleChange}
              value={formState.luongCoBan}
              onKeyDown={isNumberPress}
              onPaste={isNumberCopy}
            />
          </div>
          {user?.Loai === "ChuHeThong" && (
            <div className="form-group">
              <label htmlFor="chiNhanh">Chi nhánh làm việc</label>
              <select
                name="chiNhanh"
                onChange={handleChange}
                value={formState.chiNhanh}
              >
                {branches.map((item, index) => (
                  <option key={index} value={item.tenChiNhanh}>
                    {item.tenChiNhanh}
                  </option>
                ))}
              </select>
            </div>
          )}
          {errors && <div className="error">{errors}</div>}
          <button type="submit" className="btnSummit" onClick={handleSubmit}>
            Lưu
          </button>
        </form>
      </div>
    </div>
  );
};

import React from "react";
import "./mistyles.css";
import { BsFillTrashFill, BsFillPencilFill } from "react-icons/bs";
import { useEffect, useState, useContext } from "react";
import { FormChiTietNhanVien } from "../components/FormChiTietNhanVien";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import api from "../api/Api";
import { auth } from "../hook/FirebaseConfig";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  deleteUser,
} from "firebase/auth";
import { AuthContext } from "../hook/AuthProvider";

const XemThongTinNhanVien = (props) => {
  const { user } = useContext(AuthContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [staffs, setStaffs] = useState([]);
  const [rowToEdit, setRowToEdit] = useState(null);
  const [searchCriteria, setSearchCriteria] = useState({
    maNhanVien: "",
    tenNhanVien: "",
    chucVu: "Tất cả",
    chiNhanh: "",
    luongDau: "",
    luongCuoi: "",
  });

  const [branches, setBranches] = useState(user?.chinhanh || []);
  const [positions, setPositions] = useState([
    "Tất cả",
    "Nha sĩ",
    "Phụ tá",
    "Quản lý",
    "Tiếp tân",
  ]);

  useEffect(() => {
    getStaffs();
    getBranches();
  }, []);

  const getStaffs = async () => {
    const staffs = await api.getAllStaffs();
    if (user?.Loai !== "ChuHeThong") {
      const fil = staffs.filter((item, idx) => item.chiNhanh === user.chinhanh);
      setStaffs(fil);
    } else {
      setStaffs(staffs);
    }
  };

  const getBranches = async () => {
    if (user?.Loai === "ChuHeThong") {
      const branches = await api.getAllBranchs();
      setBranches([{ tenChiNhanh: "Tất cả" }, ...branches]);
    }
  };

  const handleDeleteRow = async (targetIndex) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this staff?"
    );
    if (shouldDelete) {
      setStaffs(staffs.filter((_, idx) => idx !== targetIndex));
      api.deleteStaff(staffs[targetIndex].Id);
      const id = await api.findAccountofStaff(staffs[targetIndex].maNhanVien);
      console.log("id" + id);
      if (id) {
        api.deleteUserAccount(id);
      }
    }
  };

  const handleEditRow = (idx) => {
    setRowToEdit(idx);
    setModalOpen(true);
  };

  const handleSubmit = async (newRow) => {
    console.log(newRow);
    if (rowToEdit == null) {
      if (user?.Loai === "ChuHeThong") {
        const id = await api.addStaff(newRow);
        newRow.Id = id;
        setStaffs([...staffs, newRow]);
      } else {
        const id = await api.addStaff({ ...newRow, chiNhanh: user?.chinhanh });
        newRow.Id = id;
        setStaffs([...staffs, { ...newRow, chiNhanh: user?.chinhanh }]);
      }
      createUserWithEmailAndPassword(auth, newRow.email, newRow.soDienThoai)
        .then((userCredential) => {
          sendPasswordResetEmail(auth, auth.currentUser.email)
            .then(() => {
              // Thành công, có thể thông báo cho người dùng về việc gửi email đặt lại mật khẩu, mật khẩu mặc định là số đt
              console.log("Đã gửi email đặt lại mật khẩu.");
            })
            .catch((error) => {
              // Xử lý lỗi nếu có
              console.error("Lỗi khi gửi email đặt lại mật khẩu: ", error);
            });
          // Signed up
          const user = userCredential.user;
          console.log(user);
          const userData = {
            id: auth.currentUser.uid,
            ten: newRow.tenNhanVien,
            email: auth.currentUser.email,
            maNV: newRow.maNhanVien,
            chinhanh: newRow.chiNhanh,
            tuoi: "",
            diachi: "",
            CCCD: "",
            SDT: newRow.soDienThoai,
            Loai: newRow.chucVu,
          };
          api.setUserInfo(userData).catch((error) => console.error(error));
          // ...
        })
        .catch((error) => {
          console.log("Error sign up", error);
          // ..
        });
    } else {
      api.updateStaff(newRow, newRow.Id);
      let updatedStaffs = staffs.map((currRow, idx) => {
        if (idx !== rowToEdit) return currRow;
        return newRow;
      });
      setStaffs(updatedStaffs);
      const id = await api.findAccountofStaff(newRow.maNhanVien);
      api.updateUser({
        id: id,
        ten: newRow.tenNhanVien,
        chinhanh: newRow.chiNhanh,
        SDT: newRow.soDienThoai,
        Loai: newRow.chucVu,
      });
    }
  };

  const handleChange = (e) => {
    setSearchCriteria({ ...searchCriteria, [e.target.name]: e.target.value });
  };

  const onSearch = async () => {
    console.log(searchCriteria);

    const searchResults = await api.getStaffsBySeacrh(searchCriteria);
    console.log(searchResults);
    setStaffs(searchResults);
  };
  return (
    <div>
      <div className="mb-3 mt-3">
        <input
          className="block m-2 customBox"
          type="text"
          placeholder="Nhập mã nhân viên"
          name="maNhanVien"
          onChange={handleChange}
        />
        <input
          className="block m-2 customBox"
          type="text"
          id="name"
          placeholder="Nhập tên nhân viên"
          name="tenNhanVien"
          onChange={handleChange}
        />

        <text>Chức vụ: </text>
        <select
          className="customBox"
          id="type"
          name="chucVu"
          onChange={handleChange}
        >
          {positions.map((item, index) => (
            <option key={index} value={item}>
              {item}
            </option>
          ))}
        </select>
        <text style={{ marginLeft: 10 }}>Chi nhánh: </text>
        <select
          className="customBox"
          id="type"
          name="chiNhanh"
          onChange={handleChange}
        >
          {user?.Loai === "ChuHeThong" ? (
            branches.map((item, index) => (
              <option key={index} value={item.tenChiNhanh}>
                {item.tenChiNhanh}
              </option>
            ))
          ) : (
            <option value={user?.chinhanh}>{user?.chinhanh}</option>
          )}
        </select>
        <div>
          <text>Lương cơ bản: Từ </text>
          <input
            className="block m-2 px-4 customBox"
            type="number"
            placeholder="0"
            name="luongDau"
            onChange={handleChange}
          />
          <text>đến</text>
          <input
            className="block m-2 px-4 customBox"
            type="number"
            placeholder="1000000000"
            name="luongCuoi"
            onChange={handleChange}
          />
        </div>
      </div>
      <button
        type="submit"
        className="bluecolor block m-2 bg-0096FF hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
        onClick={onSearch}
      >
        Tìm kiếm
      </button>
      <button
        onClick={() => setModalOpen(true)}
        className="bluecolor block m-2 bg-0096FF hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
      >
        Thêm
      </button>
      <h1 className="noteVND">**Tính theo đơn vị VNĐ</h1>
      <table className="table">
        <thead>
          <tr className="table-secondary">
            <th>Mã nhân viên</th>
            <th>Họ và tên</th>
            <th>Số điện thoại</th>
            <th>Email</th>
            <th>Chức vụ</th>
            <th>Bằng cấp</th>
            <th>Kinh nghiệm</th>
            <th>Chi nhánh làm việc</th>
            <th></th>
          </tr>
        </thead>
        {staffs.map((row, idx) => {
          return (
            <tr key={row.Id}>
              <td>{row.maNhanVien}</td>
              <td>{row.tenNhanVien}</td>
              <td>{row.soDienThoai}</td>
              <td>{row.email}</td>
              <td>{row.chucVu}</td>
              <td>{row.bangCap}</td>
              <td>{row.kinhNghiem}</td>
              <td>{row.chiNhanh}</td>
              <td className="fit">
                <span className="actions">
                  <BsFillTrashFill
                    className="delete-btn"
                    onClick={() => handleDeleteRow(idx)}
                  />
                  <BsFillPencilFill
                    className="edit-btn"
                    onClick={() => handleEditRow(idx)}
                  />
                </span>
              </td>
            </tr>
          );
        })}
        <tbody></tbody>
      </table>
      {modalOpen && (
        <FormChiTietNhanVien
          closeModal={() => {
            setModalOpen(false);
            setRowToEdit(null);
          }}
          onSubmit={handleSubmit}
          defaultValue={rowToEdit !== null && staffs[rowToEdit]}
          staffs={staffs}
        />
      )}
    </div>
  );
};
export default XemThongTinNhanVien;

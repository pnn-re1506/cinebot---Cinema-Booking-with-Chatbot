import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";
import { appRoutes } from "./router";

const routes: Array<[string, string]> = [
  ["/", "Trang chủ"],
  ["/movies/dune-part-two", "Chi tiết phim"],
  ["/booking/42", "Đặt vé"],
  ["/checkout/11111111-1111-4111-8111-111111111111", "Thanh toán"],
  ["/checkout/11111111-1111-4111-8111-111111111111/result", "Kết quả thanh toán"],
  ["/pay/mock/7", "Thanh toán thử"],
  ["/bookings/lookup", "Tìm vé"],
  ["/membership", "Hội viên"],
  ["/cinema", "Rạp chiếu"],
  ["/account", "Tài khoản"],
  ["/missing-page", "Không tìm thấy trang"],
  ["/admin/login", "Đăng nhập quản trị"],
  ["/admin", "Tổng quan"],
  ["/admin/movies", "Phim"],
  ["/admin/rooms", "Phòng chiếu"],
  ["/admin/showtimes", "Suất chiếu"],
  ["/admin/templates", "Mẫu suất chiếu"],
  ["/admin/pricing", "Giá vé"],
  ["/admin/snacks", "Bắp nước"],
  ["/admin/bookings", "Đơn đặt vé"],
  ["/admin/audit-log", "Nhật ký"],
];

describe("routes", () => {
  it.each(routes)("renders the placeholder for %s", async (path, title) => {
    const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
    render(<RouterProvider router={router} />);
    expect(await screen.findByRole("heading", { level: 1, name: title })).toBeInTheDocument();
  });
});

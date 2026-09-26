# PRD: Hệ thống đặt vé xem phim, chatbox và kiosk

| Thuộc tính | Giá trị |
| --- | --- |
| Phiên bản | 1.0 (bản thảo để chốt yêu cầu) |
| Cập nhật | 26/09/2026 |
| Phạm vi ban đầu | Một rạp, nhiều phòng chiếu; mô hình dữ liệu hỗ trợ nhiều rạp |
| Nền tảng | Website khách hàng, website admin, giao diện kiosk |
| Ngôn ngữ | Tiếng Việt và tiếng Anh |

> **Quyết định chưa chốt:** Quy tắc ghế lẻ ở mục 8 có hai phương án. Tài liệu tạm lấy phương án A, phù hợp với yêu cầu ban đầu và ngoại lệ đoạn A1-A2 mà chủ sản phẩm đã xác nhận. Cần chốt trước khi lập trình và kiểm thử sơ đồ ghế.

## 1. Tổng quan sản phẩm

Hệ thống cho phép khách xem thông tin phim, tìm suất chiếu, chọn loại vé và ghế, mua bắp nước, thanh toán và nhận vé điện tử. Khách có thể đặt vé bằng tài khoản hoặc không cần đăng nhập. Chatbox hỗ trợ hỏi đáp, tư vấn phim và hoàn tất quy trình đặt vé ngay trong giao diện chat. Admin quản lý dữ liệu phim, phòng, suất chiếu và đơn hàng. Kiosk hỗ trợ tra cứu và in vé; nhân viên check-in vé tại cửa rạp.

Sản phẩm ban đầu phục vụ một rạp, nhưng mô hình dữ liệu và phân quyền phải cho phép thêm rạp khác mà không cần thiết kế lại cơ sở dữ liệu. Bản demo portfolio phải có phim và suất chiếu để người xem có thể trải nghiệm bất cứ lúc nào, trong khi chức năng admin vẫn hoạt động trên dữ liệu demo riêng.

### 1.1 Mục tiêu

- Hoàn tất quy trình đặt vé từ chọn phim đến nhận vé, cho cả khách vãng lai và thành viên.
- Không bán trùng ghế khi nhiều người đặt cùng một suất.
- Hiển thị chính xác phim, lịch chiếu, giá và trạng thái ghế trên website, chat và kiosk.
- Cho phép admin cập nhật phim và công bố lịch chiếu mà không ảnh hưởng đến đơn đã bán.
- Cho phép khách tự tra cứu/in vé và nhân viên check-in, kể cả trường hợp in lại hoặc quét lại.
- Duy trì bản demo có thể truy cập qua nhiều ngày, với thanh toán thử nghiệm và dữ liệu ổn định.

### 1.2 Chỉ số theo dõi

- Tỷ lệ từ bắt đầu chọn ghế đến thanh toán thành công; tỷ lệ bỏ đơn ở từng bước.
- Số lần giữ ghế thất bại do trùng ghế; số trường hợp bán trùng ghế: **0**.
- Tỷ lệ thanh toán thành công, thất bại, chờ xử lý và hoàn tiền.
- Tỷ lệ câu hỏi được chat giải quyết bằng rule/API, số lần gọi LLM, chi phí trung bình mỗi phiên chat.
- Số vé được in, in lại, check-in thành công và bị từ chối do quét trùng.
- Số ngày liên tiếp bản demo có ít nhất một suất chiếu trong tương lai để đặt vé.

### 1.3 Ngoài phạm vi ban đầu

- Giao diện đặt vé trên nhiều rạp (cơ sở dữ liệu vẫn hỗ trợ nhiều rạp).
- Bán vé cho phim ở trạng thái **Sắp chiếu** trong phiên bản đầu, kể cả khi admin đã tạo suất nháp.
- Thanh toán thẻ trực tiếp bên trong chat; thông tin thẻ do cổng thanh toán xử lý.
- Đổi/hoàn vé tự động, xếp hạng hội viên, voucher phức tạp, ứng dụng di động native.
- Đồng bộ với phần mềm POS, máy in chuyên dụng hoặc hệ thống lịch chiếu của bên thứ ba. Kiosk demo có thể dùng chức năng in của trình duyệt.

## 2. Người dùng và quyền

| Vai trò | Nhu cầu và quyền chính |
| --- | --- |
| Khách vãng lai | Xem phim, đặt vé, thanh toán, nhận mã đặt vé; tra cứu bằng mã và xác minh thông tin liên hệ. |
| Thành viên | Có toàn bộ quyền của khách vãng lai; lưu thông tin liên hệ, xem lịch sử đặt vé và điểm hội viên. |
| Nhân viên cửa rạp | Tra cứu vé, quét mã, check-in và xem trạng thái vé; không được sửa lịch chiếu. |
| Admin rạp | Quản lý phim, phòng, sơ đồ ghế, giá, snack, suất chiếu và đơn hàng trong phạm vi rạp được giao. |
| Quản trị hệ thống | Quản lý rạp, tài khoản admin, phân quyền và cấu hình chung. |

Kiosk công cộng chỉ cho phép tra cứu/in vé sau khi xác minh. Chức năng check-in chỉ hiển thị cho nhân viên đã đăng nhập.

## 3. Hành trình người dùng

### 3.1 Đặt vé trên website

1. Khách chọn tab **Đang chiếu** hoặc **Sắp chiếu**, xem danh sách phim và lọc/tìm kiếm.
2. Với phim đang chiếu, khách chọn ngày, suất chiếu và phòng/rạp nếu có nhiều kết quả.
3. Khách chọn số lượng vé Người lớn, HSSV-U22 và/hoặc ghế đôi, sau đó mở sơ đồ ghế.
4. Khách chọn đúng số ghế tương ứng và gán loại vé cho từng ghế đơn nếu đơn có cả vé Người lớn và HSSV-U22. Hệ thống hiển thị giá, tình trạng ghế, nhắc về giấy tờ U22 và thông báo nếu lựa chọn tạo ghế lẻ không hợp lệ.
5. Khi khách xác nhận tập ghế đã chọn, server kiểm tra và giữ tất cả ghế của đơn trong thời gian giới hạn. Khách tiếp tục chọn snack/combo nếu muốn và xem tổng tiền trước khi thanh toán.
6. **Khách vãng lai:** nhập họ tên, số điện thoại, email -> thanh toán -> xem vé. **Thành viên:** thông tin liên hệ được điền sẵn và có thể sửa -> thanh toán -> xem vé. Chỉ hiển thị vé sau khi hệ thống xác nhận thanh toán thành công.
7. Khách nhận email xác nhận và có thể tra cứu vé sau đó.

### 3.2 Đặt vé trong chat

Chat nhận yêu cầu bằng tiếng Việt hoặc tiếng Anh, gợi ý phim, lọc lịch chiếu và hiển thị các thành phần tương tác để chọn suất, loại vé, ghế, snack và thông tin liên hệ. Người dùng có thể hoàn tất đến bước thanh toán mà không phải chuyển sang một quy trình đặt vé khác. Nếu cổng thanh toán cần chuyển trang, chat giữ ngữ cảnh và hiển thị vé sau khi khách quay lại và thanh toán được xác nhận.

### 3.3 Tra cứu, in vé và check-in

Khách nhập mã đặt vé khó đoán và một yếu tố xác minh (đề xuất: 4 số cuối điện thoại hoặc OTP) tại kiosk. Kiosk chỉ hiển thị đơn đã thanh toán, cho xem/in từng vé và in lại. Nhân viên quét QR của từng vé tại cửa rạp. In vé không tự động check-in; quét lại vé đã check-in phải bị từ chối và hiển thị rõ trạng thái đã sử dụng.

## 4. Danh mục phim và nội dung

### FR-01. Danh sách phim

- Kế thừa prototype danh sách phim hiện có và bổ sung mục **Sắp chiếu** bên cạnh **Đang chiếu**. Tìm kiếm theo tên; lọc theo thể loại, ngày, khung giờ và rạp khi đã mở rộng nhiều rạp.
- Poster trên desktop hiển thị thông tin khi di chuột: thể loại, thời lượng, quốc gia, ngôn ngữ thuyết minh/phụ đề. Trên mobile, thông tin phải xem được bằng thao tác chạm, không phụ thuộc vào hover.
- Nhấn poster để mở trang chi tiết phim. Thông tin gồm tên, poster, thể loại, thời lượng, quốc gia, ngôn ngữ, giới hạn độ tuổi, đạo diễn, diễn viên, ngày khởi chiếu, mô tả/tóm tắt và trailer.
- Mọi phim ở mục **Sắp chiếu** đều hiển thị ngày khởi chiếu và **Chưa có lịch chiếu**, không thể đặt vé trong phiên bản đầu, kể cả khi admin đã tạo suất chiếu nháp cho tương lai.
- Nếu chưa có URL trailer hợp lệ, hiển thị trạng thái không có trailer. Poster/trailer sử dụng nội dung có quyền sử dụng hoặc được phép nhúng.

### FR-02. Lịch chiếu

- Mỗi suất chiếu liên kết một phim, một phòng và một thời điểm bắt đầu; cùng một phim có thể có nhiều ngày chiếu và nhiều giờ chiếu trong ngày.
- Danh sách ngày/giờ của phim **Đang chiếu** lấy từ các suất đã công bố và nằm trong tương lai, theo giờ địa phương của rạp. Không tạo bảng riêng cho từng phim/ngày/giờ.
- Hiển thị giờ, phòng, định dạng/thuộc tính suất nếu có, mức giá tương ứng và tình trạng còn vé.
- Admin không được công bố hai suất chồng giờ trong cùng phòng, bao gồm thời lượng phim, quảng cáo và thời gian dọn phòng được cấu hình.
- Sửa/hủy suất đã có đơn thanh toán cần quy trình thông báo và xử lý đơn; không được âm thầm đổi phim, giờ hoặc phòng.

## 5. Vé, sơ đồ ghế và snack

### FR-03. Loại vé và giá

| Lựa chọn | Loại ghế được chọn | Số người | Nguyên tắc giá |
| --- | --- | --- | --- |
| Người lớn | Ghế đơn | 1 | Giá vé người lớn cho một ghế. |
| HSSV-U22 | Ghế đơn | 1 | Giá ưu đãi cho một ghế; kiểm tra giấy tờ tại rạp. |
| Ghế đôi | Một vị trí ghế đôi, chọn nguyên cặp | 2 | Một mức giá ghế đôi cho cả hai người; không nhân đôi giá lần nữa. |

- Số ghế đơn được chọn phải bằng tổng số vé Người lớn và HSSV-U22. Số vị trí ghế đôi được chọn phải bằng số lượng ghế đôi trong giỏ hàng. Với đơn có cả hai loại vé ghế đơn, khách phải gán từng ghế đơn cho đúng loại vé; loại vé được hiển thị trên vé tương ứng.
- Ghế đôi là một đơn vị tồn kho, được giữ và bán nguyên cặp. Hai người nhận hai vé/quyền vào rạp riêng, cùng hiển thị nhãn ghế đôi, để có thể check-in từng người nếu đến khác lúc.
- Người mua vé U22 thấy ghi chú về điều kiện giấy tờ tại bước chọn vé, khi xác nhận đơn và trên vé điện tử. Chính sách khi không đủ điều kiện cần được chốt ở mục 15.
- Giá, phụ phí và giảm giá phải hiển thị trước thanh toán. Đơn đã tạo lưu lại giá tại thời điểm đặt để thay đổi bảng giá sau này không sửa tổng tiền của đơn cũ.

### FR-04. Sơ đồ ghế và trạng thái ghế

- Sơ đồ phân biệt ghế đơn, ghế đôi, lối đi, ghế hỏng/không bán, ghế còn trống, đang được giữ và đã bán. Mỗi trạng thái có nhãn rõ ràng, không chỉ dựa vào màu sắc.
- Ghế đôi có hình dạng riêng, chỉ chọn được nguyên cặp và nằm ở khu vực cuối/phía sau của sơ đồ ghế theo bố trí từng phòng. Hàng và vị trí cụ thể do admin cấu hình.
- Sơ đồ ghế thuộc phòng. Trạng thái bán/giữ ghế thuộc **từng suất chiếu**, không thuộc phim hay phòng một cách chung chung.
- Khách có thể chọn và bỏ chọn nhiều ghế trước khi xác nhận. Giao diện tính hợp lệ trên **toàn bộ tập ghế đã chọn**; nếu tạm thời chưa hợp lệ, hiển thị lý do và chưa cho xác nhận, nhưng vẫn cho khách chọn thêm ghế để sửa lựa chọn.
- Hệ thống gợi ý các ghế đẹp còn trống: ưu tiên các ghế liền nhau gần trung tâm hoặc ở hàng được ưu tiên; gợi ý phải phù hợp với số lượng/loại vé và quy tắc ghế lẻ. Tình trạng ghế được kiểm tra lại khi giữ ghế.
- Ngay khi khách xác nhận tập ghế, server kiểm tra giá, loại vé, quy tắc ghế lẻ và tồn kho trên dữ liệu mới nhất, sau đó giữ nguyên cả tập ghế một cách nguyên tử. Nếu một ghế không còn trống, thông báo và yêu cầu chọn lại.
- Thời gian giữ ghế đề xuất: **15 phút**, bắt đầu từ lúc xác nhận tập ghế và hiển thị đồng hồ đếm ngược trên website/chat trong cả bước chọn snack và checkout. Hết hạn thì ghế được giải phóng và đơn chưa thanh toán không thể tiếp tục thanh toán bằng lượt giữ cũ.
- Trong lúc xử lý thanh toán, hệ thống phải phân biệt đơn đang chờ cổng thanh toán xác nhận với đơn đã thành công. Kết quả chuyển trang về không đủ để khẳng định đã thanh toán.

### FR-05. Snack và combo

- Admin quản lý tên, mô tả, ảnh, giá và trạng thái kinh doanh của snack/combo.
- Khách có thể bỏ qua snack, chọn số lượng và xem tổng tiền cập nhật trước thanh toán.
- Nếu có quản lý tồn kho snack, server kiểm tra lại khi xác nhận đơn; ban đầu có thể dùng trạng thái còn bán/hết bán thay cho tồn kho chi tiết.

## 6. Thanh toán, đơn hàng và vé

### FR-06. Thanh toán

- Khách vãng lai có ba màn: **Thông tin khách hàng -> Thanh toán -> Vé**. Họ tên, số điện thoại và email là bắt buộc; kiểm tra định dạng và hiển thị tổng tiền trước khi thanh toán.
- Thành viên bỏ qua màn nhập thông tin bắt buộc: **Thanh toán -> Vé**. Thông tin liên hệ được lấy từ hồ sơ nhưng có thể sửa cho đơn hiện tại.
- Trang vé hiển thị mã đặt vé, phim, rạp, phòng, ngày giờ, loại vé gắn với từng ghế, snack, tổng tiền đã thanh toán, QR/mã vé riêng và ghi chú U22 nếu áp dụng.
- Hệ thống gửi email xác nhận sau khi nhận thanh toán thành công; nếu gửi email lỗi, đơn/vé vẫn hợp lệ và admin có thể gửi lại.
- Khách vãng lai có thể tra cứu đơn bằng mã đặt vé và xác minh thông tin liên hệ. Giới hạn số lần thử để ngăn dò mã đặt vé hàng loạt.

### FR-07. Trạng thái và xử lý thanh toán

| Thực thể | Trạng thái tối thiểu |
| --- | --- |
| Ghế của suất | Trống, đang giữ, đã bán, khóa/không bán |
| Đơn hàng | Đang giữ ghế, chờ thanh toán, đã xác nhận, hết hạn, hủy, đã hoàn tiền |
| Giao dịch thanh toán | Khởi tạo, đang xử lý, thành công, thất bại, đã hoàn |
| Vé | Chưa sử dụng, đã check-in, vô hiệu hóa |

- Bản demo dùng cổng thanh toán sandbox. Website không lưu số thẻ hoặc dữ liệu nhạy cảm của phương thức thanh toán.
- Thông báo thanh toán từ cổng phải được xác thực và xử lý không lặp tác dụng (idempotent), kể cả khi được gửi nhiều lần. Một giao dịch thành công chỉ phát hành vé/cộng điểm một lần.
- Thanh toán thất bại cho phép thử lại nếu lượt giữ ghế còn hạn. Khi hết hạn, khách phải chọn ghế lại.
- Nếu thanh toán thành công đến muộn sau khi ghế đã được bán cho đơn khác, không phát hành vé trùng; đánh dấu đơn cần xử lý và hoàn tiền/đổi ghế theo chính sách được phê duyệt.
- Hủy suất, hoàn tiền, đổi vé và phí dịch vụ là các chính sách nghiệp vụ cần chốt trước khi vận hành thật; bản demo có thể cho admin xử lý thủ công và lưu lịch sử.

## 7. Thành viên và điểm

### FR-08. Tài khoản

- Đăng ký, đăng nhập, đăng xuất, khôi phục mật khẩu; khách vãng lai không bị buộc tạo tài khoản.
- Thành viên xem hồ sơ, lịch sử đơn, vé hiện tại và lịch sử cộng/trừ điểm.
- Điểm gắn với tài khoản đã đăng nhập khi đặt vé. Trong phiên bản đầu, đơn của khách vãng lai không tự động được cộng điểm vào tài khoản tạo sau đó.

### FR-09. Quy chế điểm đề xuất cho demo

- Mỗi **10.000 VND thực trả** sau giảm giá được 1 điểm, lấy phần nguyên; tính trên vé và snack, không tính phí dịch vụ nếu có. Tỷ lệ là cấu hình, không viết cứng trong mã.
- Cộng điểm một lần sau khi thanh toán được xác nhận. Hoàn tiền toàn bộ thì trừ lại điểm tương ứng; hoàn một phần thì tính lại trên số tiền còn giữ.
- Lưu sổ cái giao dịch điểm (lý do, đơn hàng, số điểm thay đổi, thời gian), không chỉ lưu một cột tổng điểm.
- Đổi điểm lấy ưu đãi và xếp hạng hội viên để sau bản demo đầu tiên; cần quy định hạn sử dụng điểm trước khi triển khai.

## 8. Quy tắc ghế lẻ

### 8.1 Định nghĩa chung

Ghế liền kề được xác định theo **đoạn ghế đơn liên tục trong sơ đồ phòng**, không suy từ số thứ tự ghế. Lối đi, ghế hỏng và khu ghế đôi tách đoạn. Ví dụ `A1 A2 | lối đi | A3 A4 A5 A6` có hai đoạn độc lập; A2 và A3 không liền kề.

Ghế đã bán và ghế đang được người khác giữ được xem là không còn trống. Kiểm tra tập ghế khách đang chọn trên toàn bộ đơn. Server kiểm tra lại khi giữ ghế; một ghế lẻ đã tồn tại trước đó không được làm cản trở đơn không tạo thêm ghế lẻ.

### 8.2 Phương án A - giả định mặc định của PRD

Không được **tạo mới** một nhóm chỉ còn đúng một ghế đơn trống ở đầu, giữa hoặc cuối một đoạn ghế. **Ngoại lệ:** đoạn ghế vật lý chỉ gồm đúng hai ghế được phép bán từng ghế; A1 hoặc A2 trong `A1 A2 | lối đi` đều hợp lệ. Ngoại lệ dựa trên số ghế của đoạn trong sơ đồ gốc, không dựa trên số ghế hiện còn trống.

Ví dụ với `A1 A2 | lối đi | A3 A4 A5 A6` đều trống:

| Lựa chọn cuối cùng | Kết quả |
| --- | --- |
| A1 hoặc A2 | Hợp lệ, vì đoạn vật lý A1-A2 có hai ghế. |
| A3 | Hợp lệ, A4-A6 còn thành nhóm ba ghế. |
| A4 | Không hợp lệ, tạo ghế lẻ A3 sát lối đi. |
| A5 | Không hợp lệ, tạo ghế lẻ A6 ở cuối đoạn. |
| A4 và A3 | Hợp lệ, A5-A6 còn thành nhóm hai ghế. |

### 8.3 Phương án B - đề xuất thay thế, chưa được xác nhận

Chỉ cấm tạo một ghế trống **bị kẹp giữa hai ghế không còn trống** trong cùng đoạn. Ghế lẻ sát lối đi hoặc đầu/cuối đoạn vẫn được bán cho khách đi một mình. Phương án này dễ hiểu và ít từ chối lựa chọn hơn, nhưng khác yêu cầu ban đầu về ghế lẻ bên trái/phải. Cần chủ sản phẩm chọn A hoặc B; không triển khai hai cách khác nhau giữa website và chat.

## 9. Chatbox

### FR-10. Chức năng

- Trả lời FAQ về cách đặt vé, giấy tờ U22, thanh toán, nhận/in vé, check-in, giờ hoạt động và quy định rạp.
- Tìm kiếm và gợi ý phim đang chiếu/sắp chiếu theo thể loại, nội dung, giới hạn tuổi, rạp và khung giờ. Phim ở mục **Sắp chiếu** chỉ được tư vấn thông tin và luôn hiển thị **Chưa có lịch chiếu** trong phiên bản đầu.
- Trả lời về nội dung phim, đạo diễn, diễn viên, thời lượng, ngày khởi chiếu, trailer, ngôn ngữ/phụ đề từ dữ liệu phim đã công bố.
- So sánh suất theo ngày, giờ, rạp, giá và tình trạng còn ghế từ API. Hiện tại chỉ có một rạp, nhưng giao diện và dữ liệu vẫn cho phép bổ sung rạp sau.
- Đặt vé ngay trong chat bằng các thành phần chọn phim, suất, loại vé, sơ đồ ghế, snack và thông tin liên hệ. Chat dùng cùng API giữ ghế, tính giá và thanh toán với website. Chat có thể gợi ý ghế đẹp còn trống theo cùng quy tắc của sơ đồ ghế.
- Khi không hiểu yêu cầu hoặc không tìm thấy dữ liệu, chat hỏi lại ngắn gọn hoặc chuyển đến FAQ/liên hệ hỗ trợ; không suy đoán giá, ghế trống hoặc trạng thái thanh toán.

### FR-11. Rule-based + LLM và kiểm soát chi phí

- Các yêu cầu xác định được (FAQ, tìm phim, lọc lịch, xem ghế, tính giá, đặt vé, tra đơn) ưu tiên rule/API và mẫu câu trả lời. Chỉ gọi LLM cho tư vấn mở, câu hỏi mơ hồ hoặc diễn giải nội dung.
- LLM chỉ được truy cập công cụ/API đã cho phép; dữ liệu phim và FAQ đã công bố là nguồn tham chiếu. Mọi thao tác tạo đơn/thanh toán cần xác nhận rõ của người dùng.
- Giới hạn độ dài hội thoại gửi lên LLM, số token mỗi phản hồi, tần suất theo IP/phiên/tài khoản và ngân sách theo ngày. Ngưỡng là cấu hình; khi hết ngân sách, chat vẫn hoạt động bằng rule/API.
- Lưu cache FAQ, mô tả phim và câu trả lời về nội dung ít thay đổi. Tình trạng ghế, giá thanh toán và kết quả thanh toán phải lấy mới từ server, không dựa vào cache LLM.
- Theo dõi tỷ lệ câu hỏi được rule giải quyết, lỗi trả lời thiếu căn cứ, số token và chi phí theo loại yêu cầu. Không đưa thông tin thanh toán/dữ liệu cá nhân quá mức cần thiết vào prompt.

## 10. Admin

### FR-12. Quản lý nội dung và cấu hình

- Phim: tạo/sửa/ẩn, trạng thái đang chiếu/sắp chiếu/ngừng chiếu, nội dung VI/EN, poster, trailer, thể loại, thời lượng, độ tuổi, quốc gia, ngôn ngữ/phụ đề, đạo diễn, diễn viên, ngày khởi chiếu.
- Rạp/phòng: tạo phòng, sơ đồ ghế theo hàng, lối đi, ghế đơn/ghế đôi, ghế khóa; số phòng có thể tăng/giảm bằng dữ liệu. Không sửa sơ đồ làm thay đổi ghế của suất đã công bố/đã bán; suất cần lưu bản chụp sơ đồ ghế hoặc khóa phiên bản sơ đồ.
- Suất chiếu: tạo bản nháp, kiểm tra trùng phòng/giờ, công bố, ẩn/hủy theo quyền; hiển thị lịch theo ngày/tuần, lọc theo phim/phòng. Suất nháp của phim **Sắp chiếu** không hiển thị cho khách và không thể đặt vé trong phiên bản đầu.
- Giá và snack: quản lý bảng giá theo loại vé, ngày/khung giờ nếu cần, giá ghế đôi, snack/combo và trạng thái còn bán; thay đổi giá chỉ ảnh hưởng đơn mới.
- Đơn hàng: tìm theo mã, phim, ngày, trạng thái; xem thanh toán, vé, lịch sử in/check-in và thao tác hỗ trợ có ghi nhật ký kiểm toán.
- FAQ và nội dung hỗ trợ: cập nhật VI/EN, công bố để rule/chat sử dụng cùng phiên bản.
- Phân quyền và nhật ký kiểm toán: ghi ai thay đổi phim, lịch, giá, đơn, vé và khi nào. Admin rạp chỉ sửa dữ liệu rạp mình.

### FR-13. Bản demo ổn định

- Có bộ phim mẫu được tuyển chọn gồm **Đang chiếu** và **Sắp chiếu**; phim mẫu không biến mất khỏi bản demo công khai do thao tác admin thử nghiệm.
- Có lịch chiếu tương lai cho phim **Đang chiếu**, được tạo/làm mới theo cửa sổ ngày cuốn (đề xuất 14 ngày). Mọi phim **Sắp chiếu** đều hiển thị **Chưa có lịch chiếu** và không thể đặt vé trong phiên bản đầu.
- Dữ liệu mẫu đề xuất để thử nhiều tình huống: 2 phòng có sơ đồ ghế khác nhau, 4 phim **Đang chiếu**, 3 phim **Sắp chiếu** và khoảng 3-4 suất/phòng/ngày. Đây là cấu hình khởi tạo, không phải giới hạn cứng; admin có thể thêm phòng, phim và suất.
- Thanh toán sử dụng sandbox. Đơn thử nghiệm, lượt giữ ghế và giao dịch có quy trình đặt lại để bản demo không hết vé vĩnh viễn.
- Trang admin demo hoạt động trên bộ dữ liệu thử nghiệm riêng hoặc môi trường riêng và có thể khôi phục. Không công khai quyền admin có thể sửa dữ liệu giới thiệu ổn định.
- Cần hiển thị nhãn **Demo/Thanh toán thử nghiệm** tại bước thanh toán và trên vé demo để người xem không hiểu lầm là giao dịch thật.

## 11. Kiosk và check-in

### FR-14. Kiosk công cộng

- Nhập mã đặt vé và xác minh; chỉ trả về các đơn đã thanh toán, chưa bị hủy/hoàn tiền.
- Hiển thị STT, mã đặt vé, tên khách, số điện thoại đã che một phần, phim, rạp/phòng, ngày, giờ, số ghế và danh sách vé.
- Cho in vé lần đầu và in lại, ghi nhận số lần in. Khi máy in lỗi, khách có thể thử lại mà không tạo vé mới hay check-in nhầm.
- Tự xóa thông tin phiên và trở về màn hình chờ sau thời gian không thao tác. Giới hạn số lần thử mã và không hiển thị dữ liệu nhạy cảm trên màn hình công cộng.

### FR-15. Check-in của nhân viên

- Mỗi vé có mã/QR khó đoán; ghế đôi cho hai người có hai mã vé riêng, check-in được từng người.
- Nhân viên đăng nhập để quét/nhập mã; hệ thống kiểm tra vé đã thanh toán, đúng suất, chưa bị hủy và chưa check-in.
- Quét lại vé đã sử dụng hiển thị rõ trạng thái và thời gian check-in, không tăng số người vào rạp.
- Cho phép xử lý ngoại lệ theo quyền và ghi nhật ký kiểm toán, ví dụ khi máy quét lỗi hoặc cần sửa một lượt check-in nhầm.

## 12. Yêu cầu phi chức năng và dữ liệu

### 12.1 Tính đúng đắn và hiệu năng

- Thao tác giữ ghế/thanh toán phải an toàn khi nhiều người thực hiện đồng thời; mỗi cặp `suất chiếu + ghế` chỉ có tối đa một đơn đang giữ hợp lệ hoặc đã bán.
- Trang phim, lịch và sơ đồ ghế phải tải được trên desktop/mobile; mục tiêu bản demo: 95% yêu cầu API nghiệp vụ thông thường phản hồi trong 2 giây, không tính thời gian của cổng thanh toán/LLM.
- Suất chiếu lưu mốc thời gian rõ ràng, hiển thị theo múi giờ của rạp; xác định “ngày chiếu” theo giờ địa phương, kể cả suất qua nửa đêm.
- Có nhật ký và cảnh báo lỗi thanh toán/webhook, ghế giữ quá hạn, email lỗi và chi phí LLM vượt ngưỡng.

### 12.2 Bảo mật và quyền riêng tư

- HTTPS, mật khẩu được băm an toàn, phân quyền theo vai trò/rạp, giới hạn số lần đăng nhập/tra mã, kiểm tra dữ liệu đầu vào và ghi nhật ký thao tác nhạy cảm.
- Không lưu dữ liệu thẻ; xác thực webhook. Mã đặt vé/QR phải khó đoán, không chứa dữ liệu cá nhân dưới dạng văn bản thuần.
- Chỉ thu thập họ tên, điện thoại và email cần thiết cho đơn; kiosk che một phần số điện thoại. Quy định thời gian lưu và xóa/ẩn danh dữ liệu cá nhân trước khi vận hành thật.
- Nội dung chat có thể chứa dữ liệu cá nhân; nhật ký và prompt cần hạn chế, che hoặc xóa thông tin không cần thiết.

### 12.3 Khả năng sử dụng và quốc tế hóa

- Giao diện responsive, hỗ trợ thao tác bàn phím, nhãn cho biểu tượng/trạng thái, độ tương phản dễ đọc; không truyền tải thông tin chỉ bằng hover hoặc màu sắc.
- Chuỗi giao diện, thông báo lỗi, email, FAQ và nội dung phim có bản tiếng Việt/tiếng Anh. Cho phép chuyển ngôn ngữ mà không mất giỏ hàng hoặc phiên chat đang thực hiện.
- Nếu chưa có bản dịch nội dung phim, hiển thị ngôn ngữ gốc và thông báo rõ, không để trống thông tin quan trọng.

### 12.4 Mô hình dữ liệu mức cao

| Thực thể | Mối quan hệ/trách nhiệm |
| --- | --- |
| Cinema | Một địa điểm rạp; ban đầu tạo một bản ghi, về sau có thể thêm nhiều địa điểm. |
| Room | Thuộc một Cinema; có sơ đồ ghế và thời gian dọn phòng. |
| Seat / SeatLayoutVersion | Ghế vật lý, hàng, vị trí, loại đơn/đôi, đoạn liên tục và lối đi; lưu phiên bản sơ đồ. |
| Movie | Thông tin phim, trạng thái, nội dung VI/EN. |
| Showtime | Một Movie tại một Room vào một thời điểm; trạng thái nháp/công bố/hủy. |
| ShowtimeSeat | Bản ghi tồn kho ghế theo suất; duy nhất theo `showtime_id + seat_id`, hỗ trợ giữ/bán/khóa. |
| Booking / BookingItem | Khách hàng, suất, ghế/loại vé/snack, giá chốt, trạng thái và thời hạn giữ. |
| Payment | Giao dịch và mã chống xử lý lặp/đối soát. |
| Ticket | Quyền vào rạp của từng người, mã QR và trạng thái check-in. |
| PointLedger | Mỗi lần cộng/trừ điểm và đơn liên quan. |

Các chỉ mục cần thiết gồm phim + thời gian chiếu, phòng + thời gian chiếu, mã đặt vé và khóa duy nhất suất + ghế. Thêm rạp mới là thêm Cinema/Room/Seat/Showtime và phân quyền, không cần tách cơ sở dữ liệu hay tạo bảng cho từng rạp.

## 13. Tiêu chí nghiệm thu xuyên suốt

1. Có thể tạo hai phòng, nhiều phim và nhiều suất trong cùng ngày; ghế A1 của hai suất có trạng thái độc lập.
2. Khách vãng lai hoàn tất ba màn thanh toán; thành viên bỏ qua màn nhập thông tin bắt buộc nhưng sửa được liên hệ; cả hai nhận vé sau khi thanh toán sandbox thành công.
3. Hai người cùng chọn một ghế: chỉ một lượt giữ/bán thành công; người còn lại được thông báo và chọn lại.
4. Ghế được giữ ngay sau khi xác nhận tập ghế và vẫn được giữ trong bước chọn snack/checkout cho đến khi hết hạn; thanh toán đến muộn không tạo vé trùng.
5. Chọn một ghế đôi tính một giá ghế đôi, chiếm một vị trí ghế đôi và tạo hai vé check-in riêng. Ghế đôi có hình dạng riêng ở khu vực cuối/phía sau của sơ đồ phòng và chỉ chọn được nguyên cặp.
6. Cảnh báo U22 hiển thị ở nơi chọn vé, khi thanh toán và trên vé; vé U22 chỉ chọn được ghế đơn. Với đơn có cả vé Người lớn và U22, từng ghế đơn được gán đúng loại vé và in loại vé đó trên vé tương ứng.
7. Sơ đồ ghế xử lý lối đi như ranh giới. A1 hoặc A2 trong đoạn hai ghế đều được chọn riêng; kiểm tra tập ghế cuối cùng trên server theo phương án được chốt. Gợi ý ghế đẹp chỉ gồm ghế còn trống, phù hợp loại vé/quy tắc ghế lẻ và được kiểm tra lại khi giữ ghế.
8. Mọi phim **Sắp chiếu** đều hiển thị `Chưa có lịch chiếu` và không thể tạo đơn trong phiên bản đầu, kể cả khi có suất nháp trong admin.
9. Chat trả lời dữ liệu phim/lịch/ghế từ API và hoàn tất đặt vé đến cổng thanh toán; khi giới hạn LLM, FAQ và chức năng đặt vé vẫn dùng được.
10. Kiosk in lại được vé đã thanh toán; in không check-in. Quét lại một mã đã dùng không được vào rạp lần hai.
11. Chuyển VI/EN trên cả desktop/mobile; nội dung và các bước đặt vé không bị mất khi chuyển ngôn ngữ.
12. Bản demo sau khi qua ngày mới vẫn có phim đang chiếu và suất tương lai; admin demo sửa được dữ liệu thử nghiệm mà không xóa phim giới thiệu.

## 14. Lộ trình triển khai đề xuất

| Giai đoạn | Kết quả bàn giao |
| --- | --- |
| 1. Nền tảng | Mô hình rạp/phòng/ghế/phim/suất, admin công bố lịch, danh mục phim VI/EN, phim sắp chiếu. |
| 2. Đặt vé | Sơ đồ ghế, quy tắc ghế, giữ ghế, vé ghế đơn/đôi/U22, snack, khách vãng lai/thành viên, thanh toán sandbox, vé/email. |
| 3. Vận hành | Điểm hội viên, tra cứu đơn, kiosk in vé, màn hình check-in, nhật ký kiểm toán và xử lý lỗi. |
| 4. Chat và demo | FAQ/rule/API, quy trình đặt vé trong chat, LLM tư vấn có giới hạn chi phí, dữ liệu demo theo cửa sổ ngày cuốn và cơ chế đặt lại. |

Mỗi giai đoạn chỉ hoàn tất khi kiểm tra được quy trình chính và tình huống lỗi tương ứng; đặc biệt là giữ ghế đồng thời và thông báo thanh toán lặp.

## 15. Quyết định cần chốt với chủ sản phẩm

| Vấn đề | Giả định hiện tại / lựa chọn cần chốt |
| --- | --- |
| Quy tắc ghế lẻ | Mặc định phương án A: cấm tạo ghế lẻ ở đầu/giữa/cuối, miễn cho đoạn vật lý đúng hai ghế. Phương án B chỉ cấm ghế bị kẹp ở giữa; chưa được xác nhận. |
| U22 | Định nghĩa rõ dưới 22 tuổi, HSSV hay cả hai; loại giấy tờ được chấp nhận; nếu không đủ điều kiện thì trả chênh lệch hay bị từ chối. |
| Ghế đôi | Giá trọn gói cho hai người, hai vé/check-in riêng; cần xác nhận có cho phép một người dùng ghế đôi hay bắt buộc hai người. |
| Hoàn/hủy vé | Hạn cho phép, phí, phương thức hoàn, cách xử lý khi rạp hủy suất. |
| Điểm hội viên | Tỷ lệ 1 điểm/10.000 VND là đề xuất; phạm vi tính điểm, hạn điểm và quy tắc đổi điểm cần phê duyệt. |
| Thanh toán | Chọn cổng thanh toán/sandbox và cách xử lý giao dịch thành công sau khi lượt giữ ghế hết hạn. |
| Kiosk | Xác minh bằng 4 số cuối điện thoại hay OTP; loại máy in/máy quét cho vận hành thật. |
| Bản demo admin | Hai môi trường/bộ dữ liệu riêng hay một hệ thống có khu vực sandbox và cơ chế đặt lại định kỳ. |

## 16. Hướng phát triển sau bản đầu

Các tính năng sau có giá trị nhưng không nên làm chậm luồng đặt vé cốt lõi:

- **Thông báo phim sắp chiếu:** khách đăng ký nhận email khi phim chuyển sang **Đang chiếu** và có suất được công bố.
- **Tự phục vụ sau mua:** khách đổi thông tin liên hệ, yêu cầu hủy/hoàn theo chính sách, xem tiến độ xử lý.
- **Ưu đãi hội viên:** đổi điểm, voucher, cấp bậc thành viên và ưu đãi sinh nhật; cần cơ chế chống áp dụng trùng và sổ cái điểm.
- **Chỗ ngồi tiếp cận:** đánh dấu vị trí dành cho xe lăn và ghế đi cùng, kèm quy tắc đặt phù hợp với bố trí phòng.
- **Bảng điều hành admin:** tỷ lệ lấp đầy theo suất/phòng, doanh thu vé/snack, ghế giữ rồi bỏ, hiệu quả của chat và tỷ lệ khách không đến.
- **Hỗ trợ trực tiếp:** chuyển phiên chat cùng ngữ cảnh sang nhân viên khi FAQ và LLM không giải quyết được.

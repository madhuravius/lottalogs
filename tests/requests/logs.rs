use loco_rs::testing::prelude::*;
use lottalogs::app::App;
use serial_test::serial;

#[tokio::test]
#[serial]
async fn can_get_logs() {
    request::<App, _, _>(|request, _ctx| async move {
        let res = request.get("/api/logs/").await;
        assert_eq!(res.status_code(), 200);

        // you can assert content like this:
        // assert_eq!(res.text(), "content");
    })
    .await;
}

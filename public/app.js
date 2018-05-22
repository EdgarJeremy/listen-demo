$(function () {

    $("#loading-page").show();
    window.socket = io();
    $online_list = $("#online-list");

    window.socket.on("connect", () => {
        window.socketID = socket.id;
        httpGET("/cek_status").then((status) => {
            if (!status.status) {
                loginPage();
            } else {
                panelPage();
            }
        });
        window.socket.off("update_online");
        window.socket.on("update_online", (online) => {
            $("#total").html(online.length);
            $online_list.html("");
            online.forEach((item, i) => {
                $online_list.append(`
                    <li class="list-group-item">${item.name} - ${item.id}</li>
                `);
            });
        });
    });

});

function loginPage() {
    $loginPage = $("#login-page");
    $panelPage = $("#panel-page");
    $loading = $("#loading-page");

    $loading.fadeOut();
    $panelPage.hide();
    $loginPage.fadeIn();

    $form = $("#form");
    $form.off("submit");
    $form.on("submit", function (ev) {
        ev.preventDefault();
        var name = $("#form input[name='name']").val();
        if (name) {
            var post = { name };
            $loading.show();
            httpPOST("/login", post).then((data) => {
                panelPage();
            });
        } else alert("Masukkan nama");
    });
}

function panelPage() {
    $loginPage = $("#login-page");
    $panelPage = $("#panel-page");
    $loading = $("#loading-page");
    $username = $("#username");
    $online_list = $("#online-list");

    httpGET("/cek_status").then((status) => {
        if (status.status) {
            $loading.fadeOut();
            $loginPage.hide();
            $panelPage.fadeIn();
            $username.html(status.data.name);
            $logout = $("#logout");
            $logout.off("click");
            $logout.on("click", function (ev) {
                $loading.show();
                httpGET("/logout").then((status) => {
                    loginPage();
                });
            });
        }
    });
}

function httpGET(endpoint) {
    return fetch(endpoint, {
        headers: {
            "x-socket-id": window.socketID
        },
        credentials: "same-origin"
    }).then((response) => response.json()).catch(alert);
}

function httpPOST(endpoint, data) {
    return fetch(endpoint, {
        body: JSON.stringify(data),
        headers: {
            "x-socket-id": window.socketID,
            "Content-Type": "application/json"
        },
        method: "POST",
        credentials: "same-origin"
    }).then((response) => response.json()).catch(alert);
}
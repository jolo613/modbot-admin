const API_URI = "http://localhost:8080/";
const DISCORD_AVATAR_URI = "https://cdn.discordapp.com/";

const listeners = {
    profileImageChange: [
        function(avatar) {
            // update global picture
            $(".profile-picture").attr("src", avatar);
        },
    ],
    twitchAccountsChange: [
        function(accounts) {

            console.log(accounts);
            let table = `<table>`;

            accounts.forEach(account => {
                table += `
                <tr class="account-row">
                    <td><img class="rounded-square-avatar" src="${account.profile_image_url}" alt="Profile picture for Twitch user '${account.display_name}'"></td>
                    <td>
                        <span class="account-name">${account.display_name}${account.affiliation === "partner" ? '&nbsp;<i class=\"fas fa-badge-check\"></i></span>' : ''}</span>
                        <span class="account-stats">${account.follower_count !== null ? `<span class="highlight">${account.follower_count}</span> followers • ` : ''}${account.view_count !== null ? `<span class="highlight">${account.view_count}</span> profile views • ` : ''}User ID <span class="highlight">${account.id}</span>${account.affiliation === null ? '' : (account.affiliation === "partner" ? " • <span class=\"highlight\">Partner <i class=\"far fa-badge-check\"></i></span>" : " • <span class=\"highlight\">Affiliate</span>")}</span>
                    </td>
                </tr>`;
            });

            table += '</table>';
            // update linked accounts list
            $(".twitch-accounts").html(table);
        }
    ],
    discordAccountsChange: [
        function(accounts) {

            console.log(accounts);
            let table = `<table>`;

            accounts.forEach(account => {
                let pfp = null;

                if (account.avatar !== null) {
                    pfp = DISCORD_AVATAR_URI + "avatars/" + account.id + "/" + account.avatar + ".png";
                } else {
                    pfp = DISCORD_AVATAR_URI + "embed/avatars/" + account.discriminator + ".png";
                }

                table += `
                <tr class="account-row">
                    <td><img class="rounded-square-avatar" src="${pfp}" alt="Profile picture for Discord user '${account.name}'"></td>
                    <td>
                        <span class="account-name">${account.name}</span>
                        <span class="account-stats">Tag <span class="highlight">${account.name + "#" + account.discriminator}</span> • User ID <span class="highlight">${account.id}</span></span>
                    </td>
                </tr>`;
            });

            table += '</table>';
            // update linked accounts list
            $(".discord-accounts").html(table);
        }
    ]
}

function emit(event, params) {
    if (typeof(params) !== "object") params = [params];

    if (listeners[event]) {
        listeners[event].forEach(function(listener) {
            listener(...params);
        });
    }
}

// https://stackoverflow.com/questions/1599287/create-read-and-erase-cookies-with-jquery
function createCookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    }
    else var expires = "";               

    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}

const api = {
    get: function(uri, callback) {
        $.ajax({
            type: "GET",
            url: API_URI + uri,
            headers: {
                "Authorization": readCookie("session")
            },
            success: callback
        });
    }
}

$(document).ready(function() {
    api.get("identity", function(data) {
        if (data.success) {
            emit("twitchAccountsChange", [data.data.profiles.twitch]);
            emit("discordAccountsChange", [data.data.profiles.discord]);
            if (data.data.profiles.discord.length > 0) {
                if (data.data.profiles.discord[0].avatar !== null) {
                    emit("profileImageChange", DISCORD_AVATAR_URI + "avatars/" + data.data.profiles.discord[0].id + "/" + data.data.profiles.discord[0].avatar + ".png");
                } else {
                    emit("profileImageChange", DISCORD_AVATAR_URI + "embed/avatars/" + data.data.profiles.discord[0].discriminator + ".png");
                }
            } else if (data.data.profiles.twitch.length > 0) {
                if (data.data.profiles.twitch[0].profile_image_url) {
                    emit("profileImageChange", data.data.profiles.twitch[0].profile_image_url);
                }
            }
        } else {
            console.error(data.error);
        }
    });
});
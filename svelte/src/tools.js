import { dict, toasts, confirmation } from "./store";

let dictTime;

dict.subscribe(dict => {
    if (dict && dict.time) {
        dictTime = dict.time;
    }
});

export function showToast(text, type="alert", duration=5000)
{
    const toast = {
        text:     text,
        type:     type,
        duration: duration
    };

    toasts.update(t => t.concat([toast]));

    if (duration) {
        setTimeout(() => {
            hideToast(toast);
        }, duration);
    }
}

export function hideToast(toast)
{
    toasts.update(t => {
        t.splice(t.indexOf(toast), 1);
        return t;
    });
}

export function confirm(dict, onYes, onNo)
{
    confirmation.set({
        dict:  dict,
        onYes: onYes,
        onNo:  onNo
    });
}

export function updateAreaHeight(area)
{
    area.style.height = "0px";
    area.style.height = area.scrollHeight + 2 + "px";
}

export function formatDT(str)
{
    let datetime = new Date(str + "Z");
    let now      = new Date();
    let diff     = now - datetime;

    if (diff < 60000)
        return dictTime.just_now;
    if (diff < 3600000)
        return dictTime.minutes_ago.replace("{{count}}", diff / 60000 >> 0);
    if (datetime.getDate() == now.getDate())
        return dictTime.today
            .replace("{{hours}}",   ("" + datetime.getHours()).padStart(2, '0'))
            .replace("{{minutes}}", ("" + datetime.getMinutes()).padStart(2, '0'))
            .replace("{{seconds}}", ("" + datetime.getSeconds()).padStart(2, '0'));
    if (datetime.getDate() + 1 == now.getDate())
        return dictTime.yesterday
            .replace("{{hours}}",   ("" + datetime.getHours()).padStart(2, '0'))
            .replace("{{minutes}}", ("" + datetime.getMinutes()).padStart(2, '0'))
            .replace("{{seconds}}", ("" + datetime.getSeconds()).padStart(2, '0'));
    return dictTime.default
        .replace("{{day}}",     ("" + datetime.getDate()).padStart(2, '0'))
        .replace("{{month}}",   ("" + (datetime.getMonth() + 1)).padStart(2, '0'))
        .replace("{{year}}",    ("" + datetime.getFullYear()).padStart(2, '0'))
        .replace("{{hours}}",   ("" + datetime.getHours()).padStart(2, '0'))
        .replace("{{minutes}}", ("" + datetime.getMinutes()).padStart(2, '0'))
        .replace("{{seconds}}", ("" + datetime.getSeconds()).padStart(2, '0'));
}

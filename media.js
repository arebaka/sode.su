const path      = require("path");
const fs        = require("fs");
const mmm       = require("mmmagic");
const imageSize = require("image-size");
const sharp     = require("sharp");
const imagemin  = require("imagemin");

const minSvgo     = require("imagemin-svgo");
const minPngquant = require("imagemin-pngquant");
const minMozjpeg  = require("imagemin-mozjpeg");
const minGifsicle = require("imagemin-gifsicle");
const minWepp     = require("imagemin-webp");

let magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE);

const plugins = {
    svg:  [minSvgo()],
    png:  [minPngquant({
        strip: true
    })],
    jpeg: [minMozjpeg({
        quality: 100
    })],
    gif:  [minGifsicle({
        optimizationLevel: 1
    })],
    webp: [minWepp({
        quality: 100,
        sns:     0
    })]
};




async function getImage(buffer)
{
    const format = await new Promise((resolve, reject) => {
        magic.detect(buffer, (err, result) => {
            if (err)
                resolve(null);
            else if (result.includes("svg"))
                resolve("svg");
            else if (result.includes("png"))
                resolve("png");
            else if (result.includes("jpeg") || result.includes("jpg"))
                resolve("jpeg");
            else if (result.includes("gif"))
                resolve("gif");
            else if (result.includes("webp"))
                resolve("webp");
            else
                resolve(null);
        });
    });
    if (!format)
        return null;

    const normalized = await imagemin.buffer(buffer, {
        plugins: plugins[format]
    });
    const dimensions = imageSize(normalized);

    return {
        format: format,
        buffer: normalized,
        size:   Buffer.byteLength(normalized),
        width:  dimensions.width,
        height: dimensions.height
    };
}

async function saveImage(buffer, hash, format, width, height)
{
    hash = "" + (new BigUint64Array([hash]))[0];

    fs.stat(path.resolve(`images/${hash}.${format}`), (err, stat) => {
        if (err) {
            fs.writeFileSync(path.resolve(`images/${hash}.${format}`), buffer);

            sharp(buffer)
                .resize(100, 100)
                .toFile(path.resolve(`thumbs/100/${hash}.${format}`), (err, info) => {});

            if (width > 300 || height > 300) {
                sharp(buffer)
                    .resize(300, 300)
                    .toFile(path.resolve(`thumbs/300/${hash}.${format}`), (err, info) => {});

                if (width > 500 || height > 500) {
                    sharp(buffer)
                        .resize(500, 500)
                        .toFile(path.resolve(`thumbs/500/${hash}.${format}`), (err, info) => {});

                    if (width > 1000 || height > 1000) {
                        sharp(buffer)
                            .resize(1000, 1000)
                            .toFile(path.resolve(`thumbs/1000/${hash}.${format}`), (err, info) => {});
                    }
                }
            }
        }
    });
}




module.exports = {
	image: {
        get:  getImage,
        save: saveImage
    }
};

// Next.js (and some webpack internals) may call `fs.readlinkSync()` to detect symlinks.
// On this Windows environment, Node throws `EISDIR` for *regular files*.
// We normalize that to `EINVAL` so callers can safely treat it as "not a symlink".
const fs = require('fs')

const origReadlinkSync = fs.readlinkSync

fs.readlinkSync = function patchedReadlinkSync(path, options) {
  try {
    // eslint-disable-next-line prefer-rest-params
    return origReadlinkSync.call(this, path, options)
  } catch (err) {
    if (err && err.code === 'EISDIR') {
      err.code = 'EINVAL'
      err.errno = 'EINVAL'
      err.syscall = 'readlink'
      throw err
    }
    throw err
  }
}

// Patch async form too (some webpack/Next code paths use this).
if (typeof fs.readlink === 'function') {
  const origReadlink = fs.readlink
  fs.readlink = function patchedReadlink(path, options, cb) {
    // Signature can be (path, cb) or (path, options, cb)
    if (typeof options === 'function') {
      cb = options
      options = undefined
    }

    return origReadlink.call(this, path, options, (err, resolved) => {
      if (err && err.code === 'EISDIR') {
        err.code = 'EINVAL'
        err.errno = 'EINVAL'
        err.syscall = 'readlink'
      }
      cb(err, resolved)
    })
  }
}

// Patch promises form if available.
if (fs.promises && typeof fs.promises.readlink === 'function') {
  const origPromisesReadlink = fs.promises.readlink.bind(fs.promises)
  fs.promises.readlink = function patchedPromisesReadlink(path, options) {
    return origPromisesReadlink(path, options).catch((err) => {
      if (err && err.code === 'EISDIR') {
        err.code = 'EINVAL'
        err.errno = 'EINVAL'
        err.syscall = 'readlink'
      }
      throw err
    })
  }
}


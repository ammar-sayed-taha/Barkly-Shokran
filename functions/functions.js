module.exports = {
//************ Start checkImgExt Function To check the extension of te image ************ */

checkImgExt: function checkImgExt(ext){
    ext = ext.toLowerCase()
    if(ext == 'image/png' || ext == 'image/jpg' || ext == 'image/jpeg' || ext == 'image/gif')
        return true
    else
        return false
},

//************ Start checkImgSize Function To check the size of te image ************ */
checkImgSize: function checkImgSize(imgSize){
    if(imgSize <= 1024 * 1024 * 10) //10MB
        return true
    else
        return false
},



}
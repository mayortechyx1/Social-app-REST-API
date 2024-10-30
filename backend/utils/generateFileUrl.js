const generateFileUrl = (filename)=> {
  const fileUrl = process.env.URL + `/uploads/${filename}`;
  return fileUrl; 
};

export default generateFileUrl;
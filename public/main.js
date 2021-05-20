const fetchForm = document.querySelector(".fetchForm");
const btn = document.querySelector(".btn");
const url = "http://localhost:8000/mail/";

const postFetch = () => {
  const formData = new FormData(fetchForm);
  console.log(formData);
  let object = {};
  formData.forEach(function (value, key) {
    object[key] = value;
  });
  console.log(object);
  const json = JSON.stringify(object);
  console.log(json);

  fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: json,
  })
    .then((response) => {
      return response.json();
    })
    .then((res) => {
      console.log(res);
    })
    .catch((error) => {
      console.log(error);
    });
};

btn.addEventListener("click", postFetch, false);

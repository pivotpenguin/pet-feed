function addAnimal() {
    const name = document.getElementById("name").value;
    const type = document.getElementById("type").value;
  
    if (name === "") {
      alert("名前を入力してね！");
      return;
    }
  
    const li = document.createElement("li");
  
    li.textContent = name + "（" + type + "）";
  
    document.getElementById("list").appendChild(li);
  
    document.getElementById("name").value = "";
  }
  
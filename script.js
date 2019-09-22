"use strict";
  //siden er loadet, send til funktion start
document.addEventListener("DOMContentLoaded", start);


function start() {
  let students = [];
  let allStudents = [];
  let currentStudents;
  let house;
  let sort;
  let expellStudent = [];
  let familyBlood = [];
  let gryffindor;
  let hufflepuff;
  let slytherin;
  let ravenclaw;

  const Student = {
    firstname: "",
    middlename: "",
    lastname: "",
    gender: "",
    house: "",
    imagelink: "",
    id: "",
    expelled: "",
    bloodStatus: "",
    prefect: "",
    InqSquad: ""
  };


  //Ved klik på sorter -> funktion sorter
  document.querySelectorAll("#sort-by").forEach(option => {
    option.addEventListener("change", sorter);
  });

  //Ved klik på filter -> funktion sorter
  document.querySelectorAll("#filter-by").forEach(option => {
    option.addEventListener("change", setFilter);
  });

//Henter json data
  async function getJson() {
    let jsonData = await fetch("http://petlatkea.dk/2019/hogwartsdata/students.json");
    students = await jsonData.json();
    rentArray(students);
  }

  // Kalder funktionen
  getJson();

  //Henter familie data og blodtyper
  async function getJsonBlod() {
    let jsonData = await fetch("http://petlatkea.dk/2019/hogwartsdata/families.json");
    familyBlood = await jsonData.json();

    const halfBlood = familyBlood.half;
    const pureBlood = familyBlood.pure;

    //Find halv og fuldblod
    getHalfBlood(halfBlood);
    getPureBlood(pureBlood);
  }
  getJsonBlod();

// Laver objekter og splitter dataen op for at vise den korrekt
  function rentArray(students) {
    nyElevHacked();
    students.forEach(jsonObject => {
      const student = Object.create(Student);
      jsonObject.fullname = jsonObject.fullname.trim();
      jsonObject.house = jsonObject.house.trim();
      jsonObject.fullname = jsonObject.fullname.split(" ");
      student.house = jsonObject.house.charAt(0).toUpperCase() + jsonObject.house.slice(1).toLowerCase();
      if (jsonObject.fullname.length == 3) {
        student.firstname = jsonObject.fullname[0];
        student.firstname = student.firstname.charAt(0).toUpperCase() + student.firstname.slice(1).toLowerCase();
        student.middlename = jsonObject.fullname[1];
        student.middlename = student.middlename.charAt(0).toUpperCase() + student.middlename.slice(1).toLowerCase();
        student.lastname = jsonObject.fullname[2];
        student.lastname = student.lastname.charAt(0).toUpperCase() + student.lastname.slice(1).toLowerCase();
        student.gender = jsonObject.gender.charAt(0).toUpperCase() + jsonObject.gender.slice(1).toLowerCase();
        student.imagelink = `${student.lastname.toLowerCase()}_${student.firstname.substring(0, 1).toLowerCase()}.png`;
        student.id = create_UUID();
      } else if (jsonObject.fullname.length == 2) {
        student.firstname = jsonObject.fullname[0];
        student.firstname = student.firstname.charAt(0).toUpperCase() + student.firstname.slice(1).toLowerCase();
        student.lastname = jsonObject.fullname[1];
        student.lastname = student.lastname.charAt(0).toUpperCase() + student.lastname.slice(1).toLowerCase();
        student.gender = jsonObject.gender.charAt(0).toUpperCase() + jsonObject.gender.slice(1).toLowerCase();
        student.imagelink = `${student.lastname.toLowerCase()}_${student.firstname.substring(0, 1).toLowerCase()}.png`;
        student.id = create_UUID();
      } else if (jsonObject.fullname.length == 1) {
        student.firstname = jsonObject.fullname[0];
        student.firstname = student.firstname.charAt(0).toUpperCase() + student.firstname.slice(1).toLowerCase();
        student.lastname = "Unknown";
        student.lastname = student.lastname.charAt(0).toUpperCase() + student.lastname.slice(1).toLowerCase();
        student.gender = jsonObject.gender.charAt(0).toUpperCase() + jsonObject.gender.slice(1).toLowerCase();
        student.imagelink = `${student.lastname.toLowerCase()}_${student.firstname.substring(0, 1).toLowerCase()}.png`;
        student.id = create_UUID();
      }

      if (student.bloodStatus == "") {
        student.bloodStatus = "Muggle born";
      }
      student.InqSquad = false;
      student.prefect = "";

      allStudents.push(student);
    });

    document.querySelector(".count-stud").innerHTML = `Antal elever: ${allStudents.length}`;
    document.querySelector(".count-exp").innerHTML = `Udviste elever: ${expellStudent.length}`;

    //kald filrering
    currentStudents = filtrering("All");
    visHusNummer();
    visElever();
  }

  function create_UUID() {
    //Taget fra: https://www.w3resource.com/javascript-exercises/javascript-math-exercise-23.php

    var dt = new Date().getTime();
    var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      var r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
    return uuid;
  }
// Sætter dataen ind i html templaten
  function visElever() {
    document.querySelector(".studentlist").innerHTML = "";
    let dest = document.querySelector(".studentlist");
    let temp = document.querySelector("template");

    // Laver en for each funktion for alle eleverne.
    currentStudents.forEach(student => {
      let klon = temp.cloneNode(!0).content;

      if (student[5] == "lastname") {
        if (sort == "Lastname") {
          klon.querySelector(".student h2").innerHTML = student.lastname + " " + student.firstname;
        } else {
          klon.querySelector(".student h2").innerHTML = student.firstname + " " + student.lastname;
        }
      } else {
        if (sort == "Lastname") {
          klon.querySelector(".student h2").innerHTML = student.lastname + " " + student.firstname + student.middlename;
        } else {
          klon.querySelector(".student h2").innerHTML = student.firstname + " " + student.middlename + " " + student.lastname;
        }
      }
      //Fylder hus med data
      klon.querySelector(".student h3").innerHTML = student.house;
      klon.querySelector(".student img").src = `img/${student.imagelink}`;

      klon.querySelector(".student").setAttribute("house", student.house.toLowerCase());

      klon.querySelector(".expell").dataset.id = student.id;
      klon.querySelector(".info").dataset.info = student.id;

      dest.appendChild(klon);
    });
    // Klik for at udvise elever
    document.querySelectorAll(".expell").forEach(expell => {
      expell.addEventListener("click", udivsElever);
    });

    //klik for at se popup
    document.querySelectorAll(".info").forEach(info => {
      info.addEventListener("click", visModel);
    });
  }
//pop-up funktionen
  function visModel(student) {

    let houses = event.target.dataset.house;
    let id = event.target.dataset.info;
    console.log(id);

    currentStudents.forEach(student => {
      if (student.id == id) {
        document.querySelector("#popup").classList.remove("hide");
        document.querySelector("#popup").classList.add(houses);
        document.querySelector("#popup img").src = `img/${student.imagelink}`;
        document.querySelector("#popup h1").innerHTML = student.firstname + " " + student.middlename + " " + student.lastname;
        document.querySelector("#popup h2").innerHTML = `hus: ${student.house}`;
        document.querySelector("#popup p").innerHTML = `Køn: ${student.gender}`;
        document.querySelector("#popup .blood").innerHTML = `Blod-type: ${student.bloodStatus}`;
        document.querySelector(".squad").addEventListener("click", inkvisitoriske);
        document.querySelector(".squad").dataset.id = student.id;
        document.querySelector(".prefect").dataset.id = student.id;

        if (student.prefect === "prefect") {
          document.querySelector(".prefect").addEventListener("click", elevPrefektent);
        } else {
          document.querySelector(".prefect").addEventListener("click", elevPrefekten);
          document.querySelector(".prefect").textContent = "Tilføj til præfekten";
        }

        if (student.house === "Gryffindor") {
          document.querySelector("#popup").className = "gryffindor";
          document.querySelector("#popup .crest img").src = "img/gryffindorcrest.png";
          prefektGryffindor(student);
        } else if (student.house === "Hufflepuff") {
          document.querySelector("#popup").className = "hufflepuff";
          document.querySelector("#popup .crest img").src = "img/hufflepuffcrest.png";
          prefektHufflepuff(student);
        } else if (student.house === "Slytherin") {
          document.querySelector("#popup").className = "slytherin";
          document.querySelector("#popup .crest img").src = "img/slytherincrest.png";
          prefektSlytherin(student);
        } else {
          document.querySelector("#popup").className = "ravenclaw";
          document.querySelector("#popup .crest img").src = "img/ravenclawcrest.png";
          prefektRavenclaw(student);
        }

        document.querySelector("#close-popup").addEventListener("click", skjulModel);

        function skjulModel() {
          console.log("hide modal");
          document.querySelector("#popup").classList.add("hide");
        }
      }
    });
  }

//Funktionen som sortere eleverne
  function sorter() {
    console.log("Sort json");
    // Change filter
    sort = this.value;
    console.log(sort);
    // If statement to sort by choice
    if (sort == "Firstname") {
      console.log(sort);
      // Function to sort by firstname
      currentStudents.sort(function(a, b) {
        return a.firstname.localeCompare(b.firstname);
      });
    } else if (sort == "Lastname") {
      console.log(sort);
      currentStudents.sort(function(a, b) {
        return a.lastname.localeCompare(b.lastname);
      });
    } else if (sort == "House") {
      console.log(sort);
      currentStudents.sort(function(a, b) {
        return a.house.localeCompare(b.house);
      });
    }
    //Kalder funktionen for at vise elevlisten igen
    visElever();
  }
  //funktionen som laver filtret
  function setFilter() {
    house = this.value;
    currentStudents = filtrering(house);
    visElever();
  }
  function filtrering(house) {
    console.log(house);
    let list = allStudents.filter(filterHus);

    function filterHus(student) {
      if (student.house == house || house == "All") {
        return true;
      } else {
        return false;
      }
    }
    console.log(allStudents);
    return list;
  }

  //Funktionen som udviser elever
  function udivsElever(event) {
    let elm = event.target;
    let id;
    let index;
    let index2;

    if (elm.dataset.action == "remove") {
      console.log("remove");
      id = elm.dataset.id;
      index = currentStudents.findIndex(find);
      index2 = allStudents.findIndex(find);

      function find(student) {
        if (student.id == id) {
          return true;
        } else {
          return false;
        }
      }
    }

    let removed = currentStudents.slice(index, index + 1);
    console.log(removed);
//et if statement som gør at hvis ens elevs fornavn er benjamin, kaldes funktionen udvisMig ,
    if (currentStudents[index].firstname === "Benjamin") {
      udvisMig();
    }

    removed.forEach(listeAfUdviste);
    elm.parentElement.classList.add("remove");
    currentStudents.splice(index, 1);
    allStudents.splice(index2, 1);

    document.querySelector(".count-stud").innerHTML = `Antal elever: ${allStudents.length}`;
    document.querySelector(".count-exp").innerHTML = `Udviste elever: ${expellStudent.length}`;

    elm.parentElement.addEventListener("transitionend", function() {
      this.remove();
    });

    visHusNummer();
  }

  console.table(allStudents);
  //laver listen af udviste elever
  function listeAfUdviste(student) {
    console.log("list of expelled");

    //Objekt med elevernes data
    const finalExpell = {
      firstname: "",
      middlename: "",
      lastname: "",
      gender: "",
      house: "",
      imagelink: "",
      id: ""
    };

    const expelledStudent = Object.create(finalExpell);
    expelledStudent.firstname = student.firstname;
    expelledStudent.middlename = student.middlename;
    expelledStudent.lastname = student.lastname;
    expelledStudent.gender = student.gender;
    expelledStudent.house = student.house;
    expelledStudent.imagelink = student.imagelink;
    expelledStudent.id = student.id;

    expellStudent.push(expelledStudent);
  }

  document.querySelector(".count-exp").addEventListener("click", visListeAfUdviste);
  document.querySelector(".counter button").classList.add("green");

  //Funktionen som viser listen af udviste elever
  function visListeAfUdviste() {
    document.querySelector(".list").innerHTML = `<h1>Udviste elever</h1><div class="close-list">x</div> <br>`;

    expellStudent.forEach(expellStudent => {
      document.querySelector(".list").innerHTML += `<div class="student-expelled"> <img src="img/${expellStudent.imagelink}" alt="">
      <div class="text"><h1>${expellStudent.firstname + " " + expellStudent.middlename + " " + expellStudent.lastname}</h1><h2>hus: ${expellStudent.house}</h2> <p>Eleven er blevet udvist</p></div></div>`;
    });

    document.querySelector(".list").classList.remove("hide");

    document.querySelector(".close-list").addEventListener("click", gemClass);

    function gemClass() {
      document.querySelector(".list").classList.add("hide");
    }
  }
  //Funktionen som viser hvor mange som er i de forskellige huse
  function visHusNummer() {
    console.log("test");

    //Use 'includes' to find specific house
    gryffindor = allStudents.filter(obj => obj.house.includes("Gryffindor"));
    hufflepuff = allStudents.filter(obj => obj.house.includes("Hufflepuff"));
    slytherin = allStudents.filter(obj => obj.house.includes("Slytherin"));
    ravenclaw = allStudents.filter(obj => obj.house.includes("Ravenclaw"));
    document.querySelector(".count-gryffindor").innerHTML = `Elever fra Gryffindor: ${gryffindor.length}`;
    document.querySelector(".count-hufflepuff").innerHTML = `Elever fra Hufflepuff: ${hufflepuff.length}`;
    document.querySelector(".count-slytherin").innerHTML = `Elever fra Slytherin: ${slytherin.length}`;
    document.querySelector(".count-ravenclaw").innerHTML = `Elever fra Ravenclaw: ${ravenclaw.length}`;

    console.log(hufflepuff);
  }

  //Funktionen som viser halvblod
  function getHalfBlood(halfBlood) {
    let half;

    halfBlood.forEach(student => {
      half = student;
      // console.log(half);

      allStudents.forEach(student => {
        if (student.lastname == half) {
          // console.log("The student is halfblood");
          student.bloodStatus = "Halfblood";
        }
      });
    });
  }
  //Funktionen som viser fuldblod
  function getPureBlood(pureBlood) {
    let pure;

    pureBlood.forEach(student => {
      pure = student;
      console.log(pure);

      allStudents.forEach(student => {
        if (student.lastname == pure) {
          student.bloodStatus = "Pureblood";
        }
      });
    });
    hackedBlodStatus();
  }
  // funktionen som laver listen over de inkvisitoriske
  function inkvisitoriske() {
    console.log("inkvisitoriske squad clicked");

    const id = this.dataset.id;
    console.log(id);

    allStudents.forEach(student => {
      if (student.bloodStatus === "Pureblood" || student.house === "Slytherin") {
        if (student.id == id && student.InqSquad == false) {
          student.InqSquad = true;
          document.querySelector(".squad").textContent = "Fjern fra gruppe";
          setTimeout(function() {
            fjernFraListe(id);
          }, 1000);
        } else if (student.id == id && student.InqSquad == true) {
          student.InqSquad = false;
          document.querySelector(".squad").textContent = "tilføj til gruppen";
        }
      }
      console.log(student.InqSquad);
    });
  }
  // lav en fjern fra listen funktion
  function fjernFraListe(id) {
    console.log("Remove from squad clicked");
    allStudents.forEach(student => {
      if (student.id == id && student.InqSquad == true) {
        student.InqSquad = false;
        document.querySelector(".squad").textContent = "tilføj til gruppen";
      }
    });
  }

// Blodstatus funktion
  function hackedBlodStatus() {
    console.log("Hacked Blodstatus start");

    allStudents.forEach(student => {
      if (student.bloodStatus === "Halfblood" || student.bloodStatus === "Muggle born") {
        student.bloodStatus = "Pureblood";
      } else {
        const arrayBlood = ["Pureblood", "Halfblood", "Muggle born"];
        const bloodStatus = arrayBlood[Math.floor(Math.random() * arrayBlood.length)];
        student.bloodStatus = bloodStatus;
      }
    });
  }

  function nyElevHacked() {
    const student = Object.create(Student);

    student.firstname = "Benjamin";
    student.lastname = "Worm";
    student.gender = "Boy";
    student.id = create_UUID();
    student.imagelink = "mig.jpg";

    allStudents.push(student);
  }

  function udvisMig() {
    document.querySelector("iframe").classList.remove("hide");
    document.querySelector(".remove-all").className = "remove-list";

  }
  function elevPrefekten() {
    console.log("Prefect clicked");
    console.log(allStudents);
    const id = this.dataset.id;

    allStudents.forEach(student => {
      if (student.id === id && student.prefect === "") {
        student.prefect = "prefect";
        document.querySelector(".prefect").textContent = "fjern elev fra prefekten";
      } else if (student.id === id && student.prefect === "prefect") {
        student.prefect = "";
        document.querySelector(".prefect").textContent = "Tilføj elev til prefekten";
      }
    });
  }

  function prefektGryffindor(student) {
    const prefect = gryffindor.filter(obj => obj.prefect.includes("prefect"));
    console.log(prefect.length === 2);
    if (student.prefect === "" && prefect.length === 2) {
      document.querySelector(".prefect").removeEventListener("click", elevPrefekten);
      document.querySelector(".prefect").textContent = "Too many prefects from this house";
      document.querySelector(".prefect").className = "not-allowed";
    }
  }
  function prefektHufflepuff(student) {
    const prefect = hufflepuff.filter(obj => obj.prefect.includes("prefect"));
    console.log(prefect.length === 2);
    if (student.prefect === "" && prefect.length === 2) {
      document.querySelector(".prefect").removeEventListener("click", elevPrefekten);
      document.querySelector(".prefect").textContent = "Too many prefects from this house";
      document.querySelector(".prefect").className = "not-allowed";
    }
  }
  function prefektSlytherin(student) {
    const prefect = slytherin.filter(obj => obj.prefect.includes("prefect"));
    console.log(prefect.length === 2);
    if (student.prefect === "" && prefect.length === 2) {
      document.querySelector(".prefect").removeEventListener("click", elevPrefekten);
      document.querySelector(".prefect").textContent = "Too many prefects from this house";
      document.querySelector(".prefect").className = "not-allowed";
    }
  }
  function prefektRavenclaw(student) {
    const prefect = ravenclaw.filter(obj => obj.prefect.includes("prefect"));
    console.log(prefect.length === 2);
    if (student.prefect === "" && prefect.length === 2) {
      document.querySelector(".prefect").removeEventListener("click", elevPrefekten);
      document.querySelector(".prefect").textContent = "Too many prefects from this house";
      document.querySelector(".prefect").className = "not-allowed";
    }
  }
}

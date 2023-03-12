$(document).ready(function() {
  let eFile = $("#file");
  let eResult = $("#result");
  let eWinner = $("#winner");
  let defaultExclude = [
    "user300860929", // sang mata
    "user574539108", // coinkit
    "user1000528231", // vidDL
    "user1329931855", // dust miner
    "user5555602743", // quest lord
    "user722139060", // Bloks bot
    "user5594127789", // space invento
    "user609517172", // rose
    "user5478299901", // leef miner
    "user5712652258", // Koala Information
    "user5876703890", // Improbability
  ]

  $("#upload").on('click', function () {
    let files = eFile.prop("files");
    const reader = new FileReader();
    reader.addEventListener('load', fileReader);
    reader.readAsText(files[0]);
  });

  let rawJSON = {};
  let arrCalculation = [];
  let winnerId = [];
  let totalChat = 0;
  function fileReader (e) {
    totalChat = 0;
    let userCalculation = {};
    rawJSON = JSON.parse(e.target.result);
    for (let message of rawJSON.messages) {
      if (message.text === "") continue;
      if (message.text[0] === "/") continue;
      if (message.from === null) continue;
      if (message.from_id === undefined) continue;

      if (userCalculation[message.from_id] === undefined) {
        userCalculation[message.from_id] = {
          id: message.from_id,
          count: 0,
          name: message.from
        };
      }

      userCalculation[message.from_id].count += 1;
      totalChat += 1;
    }

    arrCalculation = Object.values(userCalculation);
    arrCalculation.sort((a, b) => a.count - b.count)
    for (let u of arrCalculation) {
      let isChecked = defaultExclude.includes(u.id) ? "checked" : "";
      let eTr = `<tr>
        <td align="center"><input type="checkbox" data-id="${u.id}" class="excludes" ${isChecked}></td>
        <td>${u.id}</td>
        <td>${u.name}</td>
        <td>${u.count}</td>
      </tr>`;
      $("#participant tbody").append(eTr)
    }
  }

  function shuffle(array) {
    let currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex !== 0) {

      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
  }

  function getExcludeId() {
    let tmp = [];
    for (let eEx of $(".excludes:checked")) {
      tmp.push($(eEx).data('id'));
    }

    return tmp;
  }

  let blankWinner = 0;
  let totalNumber = 0;
  function mixParticipant() {
    let raw_participant = [];
    let minimum = $("#minimum_chat").val();
    if (isNaN(minimum)) minimum = 0;
    let exclude = getExcludeId();
    let finalParticipant = [...arrCalculation];
    if (blankWinner > 0) {
      finalParticipant.push({
        id: "user0000",
        count: Math.ceil(totalChat * (blankWinner / 100)),
        name: "@Next_Pool"
      });
    }
    for (let part of finalParticipant) {
      if (part.count < minimum) continue;
      if (exclude.includes(part.id)) continue;
      if (winnerId.includes(part.id)) continue;

      raw_participant.push(part);
    }

    let startNumber = 1;
    shuffle(raw_participant);
    eResult.find("tbody").html("");
    for (let p of raw_participant) {
      let rRow = `<tr data-id="${p.id}"><td>${p.name}</td><td>${startNumber} - ${startNumber + p.count}</td></tr>`;
      eResult.find("tbody").append(rRow);
      startNumber += p.count + 1;
    }

    totalNumber = startNumber;
  }

  let _timer = null;
  function startTimer() {
    $("#randomNumber").html(Math.floor(Math.random() * totalNumber) + 1);
    _timer = setTimeout(startTimer, 100);
  }

  $("#raffle").on('click', function () {
    eWinner.find("tbody").html('');
    blankWinner = parseInt($("#blank_winner").val())
    if (isNaN(blankWinner)) blankWinner = 0;
    mixParticipant();
    startTimer();
  });

  $("#set_winner").on('click', function () {
    if (_timer === null) {
      alert("Please click raffle button");
      return;
    }

    let eParticipant = eResult.find("tbody tr");
    if (eParticipant.length === 1) {
      alert("Need 2 or more participant");
      return;
    }

    let winner = parseInt($("#randomNumber").html());
    for (let x of eParticipant) {
      let self = $(x);
      let strNumber = self.find('td:last-child').html().split(" - ");
      if (winner >= parseInt(strNumber[0]) && winner <= parseInt(strNumber[1])) {
        winnerId.push(self.data('id'));
        self.prepend(`<td>${winner}</td>`)
        eWinner.append(self);
        break;
      }
    }

    mixParticipant();
  });

  $("#stop").on('click', function () {
    if (_timer === null) return;
    clearTimeout(_timer);
    _timer = null;
  })
});
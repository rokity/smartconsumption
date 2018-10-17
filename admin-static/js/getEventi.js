var mostraEventi = () => {
    fetch(hostname + '/api/evento/getall')
        .then((res) => res.json())
        .then((data) => {
            if (data != null) {
                var container = document.querySelector("#eventoTable");
                container.className = ""
                document.querySelector("#inserisciProcedura").className = "d-none";
                document.querySelector("#inserisciEvento").className = "d-none";
                document.querySelector("#proceduraTable").className = "d-none";
                //Pulisco la tabella
                container = container.querySelectorAll('table')[0]
                var tbody = container.querySelectorAll('tbody')[0];
                container.removeChild(tbody);
                tbody = document.createElement("tbody");
                container.appendChild(tbody)
                //Inserisco elementi nella tabella
                data.forEach((item, index, array) => {
                    var tr = document.createElement("tr");
                    var Time = document.createElement("td");
                    Time.innerHTML = item.Time;
                    var Procedura = document.createElement("td");
                    getProceduraNameById(item.Procedura)
                        .then((json) => {
                            console.log(json)
                            Procedura.innerHTML = json[0].Name;
                            var Operations = document.createElement("td");
                            var Delete = document.createElement("button");
                            Delete.className = "btn btn-danger"
                            Delete.innerHTML = "Delete";
                            Delete.addEventListener('click', () => {
                                deleteEvento(item._id, tr)
                            }, false);
                            var Modify = document.createElement("button");
                            Modify.innerHTML = "Modify";
                            Modify.className = "btn btn-warning"
                            Modify.addEventListener('click', () => {
                                modifyEvento(item._id, tr)
                            }, false);
                            Operations.appendChild(Modify);
                            Operations.appendChild(Delete);
                            tr.appendChild(Time);
                            tr.appendChild(Procedura);
                            tr.appendChild(Operations);
                            tbody.appendChild(tr);
                        });
                })
            }
        });
}

var getProceduraNameById = (id) => {
    return fetch(hostname + '/api/procedura/getbyid/' + id)
        .then((res) => res.json())
}


var deleteEvento = (id, elementHTML) => {
    fetch(hostname + '/api/evento/delete/' + id)
        .catch((error) => console.error(error))
        .then((data) => {
            if (data.status == 200) {
                if (confirm("Operazione Riuscita!")) {
                    document.querySelector("#eventoTable").className = "d-none";
                    document.querySelector("#eventoTable").removeChild(elementHTML)
                    mostraEventi();
                }
            } else
                alert("Operazione Non Riuscito!");
        })
}


var modifyEvento = (id, elementHTML) => {
    fetch(hostname + '/api/evento/getbyid/' + id)
        .catch((error) => console.error(error))
        .then((res) => res.json())
        .then((data) => {
            if (data != null) {
                var data = data[0];
                document.querySelector("#eventoTable").className = "d-none";
                loadProcedurePerModifca();
                for (var key in data) {
                    var parametroHTML = document.querySelector('input[name="' + key + '"]');
                    if (parametroHTML != null)
                        parametroHTML.value = data[key];
                }

                document.querySelector("#inserisciEvento").className = "";
                document.querySelector("#submitEvento").setAttribute("onclick", "salvaModifcaEvento('" + id + "')");
                document.querySelector("#eventoTable").removeChild(elementHTML);
            } else {
                alert("Procedura Non Trovata!");
            }
        });
}

var salvaModifcaEvento = (id) => {
    event.preventDefault();
    var form = new FormData(document.querySelector('#inserisciEvento'));
    form.set("id", id)
    fetch(hostname + "/api/evento/update", {
            method: "POST",
            body: form
        })
        .catch((error) => console.error(error))
        .then((response) => {
            if (response.status == 200) {
                if (confirm("Inserimento Riuscito")) {
                    document.querySelector("#inserisciEvento").className = "d-none";
                    document.querySelector("#inserisciEvento").reset();
                    mostraEventi();
                }
            } else
                alert("Inserimento Non Riuscito!");
        });
}


var loadProcedurePerModifca = () => {
    fetch(hostname + '/api/procedura/getall')
        .then((res) => res.json())
        .then((data) => {
            if (data != null) {
                var selector = document.querySelector("#proceduraSelector");
                //Pulisco selecotr Procedure
                selector.innerHTML = '';
                data.forEach((item, index, array) => {
                    var option = document.createElement("option");
                    option.value = item._id;
                    option.innerHTML = item.Name;
                    selector.appendChild(option);
                })
            } else {
                alert("Non ci sono procedure!");
                document.querySelector("#inserisciEvento").className = "d-none"
            }
        });
}

var mostraProcedure = () => {
    fetch(hostname + '/api/procedura/getall')
        .then((res) => res.json())
        .then((data) => {
            if (data != null) {
                var container = document.querySelector("#proceduraTable");
                container.className = ""
                document.querySelector("#inserisciProcedura").className = "d-none";
                document.querySelector("#inserisciEvento").className = "d-none";
                document.querySelector("#eventoTable").className = "d-none";
                container = container.querySelectorAll('table')[0]
                //Pulisco la tabella
                var tbody = container.querySelectorAll('tbody')[0];
                container.removeChild(tbody);
                tbody = document.createElement("tbody");
                container.appendChild(tbody)
                // tbody.querySelectorAll("tr").forEach(
                //     (item, index, array) => {
                //         if (index != 0)
                //             container.removeChild(item)
                //     })
                //Inserisco elementi nella tabella
                data.forEach((item, index, array) => {
                    var tr = document.createElement("tr");
                    var Name = document.createElement("td");
                    Name.innerHTML = item.Name;
                    var Hostname = document.createElement("td");
                    Hostname.innerHTML = item.Hostname;
                    var Port = document.createElement("td");
                    Port.innerHTML = item.Port;
                    var Path = document.createElement("td");
                    Path.innerHTML = item.Path;
                    var Operations = document.createElement("td");
                    var Delete = document.createElement("button");
                    Delete.className="btn btn-danger"
                    Delete.innerHTML = "Delete";
                    Delete.addEventListener('click', () => {
                        deleteProcedura(item._id, tr)
                    }, false);
                    var Modify = document.createElement("button");
                    Modify.innerHTML = "Modify";
                    Modify.className="btn btn-warning"
                    Modify.addEventListener('click', () => {
                        modifyProcedura(item._id, tr)
                    }, false);
                    var Evoca = document.createElement("button");
                    Evoca.innerHTML = "Lancia";
                    Evoca.className ="btn btn-success"
                    Evoca.addEventListener('click', () => {
                        evocaEvento(item._id)
                    }, false);
                    Operations.appendChild(Modify);
                    Operations.appendChild(Delete);
                    Operations.appendChild(Evoca)
                    tr.appendChild(Name);
                    tr.appendChild(Hostname);
                    tr.appendChild(Port);
                    tr.appendChild(Path);
                    tr.appendChild(Operations);
                    tbody.appendChild(tr);
                })
            }
        });
}


var deleteProcedura = (id, elementHTML) => {
    fetch(hostname + '/api/procedura/delete/' + id)
        .catch((error) => console.error(error))
        .then((data) => {
            if (data.status == 200) {
                if (confirm("Operazione Riuscita!")) {
                    document.querySelector("#proceduraTable").className = "d-none";
                    document.querySelector("#proceduraTable").removeChild(elementHTML)
                    mostraProcedure();
                }
            } else
                alert("Operazione Non Riuscito!");
        })
}

var modifyProcedura = (id, elementHTML) => {
    fetch(hostname + '/api/procedura/getbyid/' + id)
        .catch((error) => console.error(error))
        .then((res) => res.json())
        .then((data) => {
            if (data != null) {
                var data = data[0];
                document.querySelector("#proceduraTable").className = "d-none";
                for (var key in data) {
                    var parametroHTML = document.querySelector('input[name="' + key + '"]');
                    if (parametroHTML != null)
                        parametroHTML.value = data[key];
                }

                document.querySelector("#inserisciProcedura").className = "";
                document.querySelector("#submitProcedura").setAttribute("onclick", "salvaModifcaProcedura('" + id + "')");
                document.querySelector("#proceduraTable").removeChild(elementHTML);
            } else {
                alert("Procedura Non Trovata!");
            }
        });
}

var salvaModifcaProcedura = (id) => {
    event.preventDefault();
    var form = new FormData(document.querySelector('#inserisciProcedura'));
    form.set("id", id)
    fetch(hostname + "/api/procedura/update", {
            method: "POST",
            body: form
        })
        .catch((error) => console.error(error))
        .then((res) => res.json())
        .then((data) => {
            if (data != null) {
                if (confirm("Inserimento Riuscito")) {
                   
                    document.querySelector("#inserisciProcedura").className = "d-none";
                    document.querySelector("#inserisciProcedura").reset();
                    mostraProcedure();
                }
            } else
                alert("Inserimento Non Riuscito!");
        });
}


var evocaEvento = (id) => {
    fetch(hostname + '/api/procedura/getbyid/' + id)
        .catch((error) => console.error(error))
        .then((res) => res.json())
        .then((data) => {
            if (data[0].Port != "-1")
                var url = `http://${data[0].Hostname}:${data[0].Port}/${data[0].Path}`
            else
                var url = `http://${data[0].Hostname}/${data[0].Path}`

            fetch(url)
                .catch((error) => console.error(error))
                .then((res) => res.text())
                .then((data) => {
                    console.info(data);
                    alert("Procedura Riuscita!");
                });
        });
}
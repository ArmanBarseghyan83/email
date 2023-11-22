document.addEventListener("DOMContentLoaded", function () {

  document.querySelector("#inbox").addEventListener("click", () => load_mailbox("inbox"));
  document.querySelector("#sent").addEventListener("click", () => load_mailbox("sent"));
  document.querySelector("#archived").addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);
  document.querySelector("#compose-form").addEventListener("submit", send_email);

  load_mailbox("inbox");
});

function compose_email() {
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#email-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

// Create the html elements and fetch the data from the backend for the specific mailbox.
function load_mailbox(mailbox) {
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";

  document.querySelector("#emails-view").innerHTML = `<h2>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h2>`;

  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      emails.forEach((email) => {

        const div = document.createElement("div");
        div.className = "email";

        if (mailbox === "sent") {
          div.innerHTML = `<div><div><b>${email.recipients}</b></div> <div>${email.subject}</div> </div> <div>${email.time}</div>`;
        } else {
          div.innerHTML = `<div></div/><div> <div><b>${email.sender}</b></div> <div>${email.subject}</div> </div> <div>${email.time}</div>`;
        }

        if (!email.read) {
          div.firstChild.className = "unread";
        }

        document.querySelector("#emails-view").append(div);
        div.addEventListener("click", () => {

          document.querySelector("#emails-view").style.display = "none";
          document.querySelector("#email-view").style.display = "block";

          fetch(`/emails/${email.id}`, {
            method: "PUT",
            body: JSON.stringify({
              read: true,
            }),
          });

          createEmailPage(mailbox, email)

        });
      });

      document.querySelector("#email-view").style.display = "none";
    });
}


// Create the html elements and fetch the data from the backend for the specific email.
function createEmailPage(mailbox, email) {
  const p1 = document.createElement("p");
  const p2 = document.createElement("p");
  const p3 = document.createElement("p");
  const p4 = document.createElement("p");
  const btn1 = document.createElement("button");
  const btn2 = document.createElement("button");
  btn1.className = "btn btn-sm btn-info";
  btn2.className = "btn btn-sm btn-secondary";
  btn2.style.margin = "4px";
  const hr = document.createElement("hr");
  const p5 = document.createElement("p");
  btn1.innerHTML = "Reply";
  btn2.innerHTML = "Archive";
  p1.innerHTML = `<b>From:</b> ${email.sender}`;
  p2.innerHTML = `<b>To:</b> ${email.recipients}`;
  p3.innerHTML = `<h4>${email.subject}</h4> `;
  p4.style.cssText = "color: rgb(126, 126, 126); position: relative; margin-left: auto;";
  p4.innerHTML = email.timestamp;
  p5.innerHTML = email.body;

  if (email.archived) {
    btn2.innerHTML = "Unarchive";
  }

  if (mailbox == "sent") {
    btn1.style.display = "none";
    btn2.style.display = "none";
  }

  btn1.addEventListener("click", () => {

    compose_email();
    document.querySelector("#compose-recipients").value = email.sender;
    if (email.subject.includes("Re:")) {
      document.querySelector("#compose-subject").value = email.subject;
    } else {
      document.querySelector("#compose-subject").value = `Re: ${email.subject}`;
    }

  });

  btn2.addEventListener("click", () => {

    if (!email.archived) {
      fetch(`/emails/${email.id}`, {
        method: "PUT",
        body: JSON.stringify({
          archived: true,
        }),
      })
        .then(() => load_mailbox("archive"));

    } else if (email.archived) {
      fetch(`/emails/${email.id}`, {
        method: "PUT",
        body: JSON.stringify({
          archived: false,
        }),
      })
        .then(() => load_mailbox("inbox"));
    }
  });

  document.querySelector("#email-view").innerHTML = "";
  document.querySelector("#email-view").append(p1, p2, p4, btn1, btn2, hr, p3, p5);
}

// Collect the form data and fetch data to the backend for sending a new email.
function send_email(e) {
  e.preventDefault();

  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: document.querySelector("#compose-recipients").value,
      subject: document.querySelector("#compose-subject").value,
      body: document.querySelector("#compose-body").value,
    }),
  })
    .then((response) => response.json())
    .then(() => load_mailbox("sent"));
}

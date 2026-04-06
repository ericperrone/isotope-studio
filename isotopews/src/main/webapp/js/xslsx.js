var sampleFields = Array();

function selectSheet(sheet) {
	let payLoad = JSON.stringify({ 'sheet': sheet });
	$("#work-area").empty();

	$.ajax({
		type: "POST",
		url: "fragments/receiver-xslx-fragment.jsp",
		data: payLoad,
		success: function() {
			$.get("fragments/xslx-fragment.jsp", (data) => {
				$("#work-area").append(data);
			});
		},
	});
}

function toggleSelection(id) {
	let position = -1;
	if ((position = searchField($("#" + id).html())) < 0) {
		sampleFields.push($("#" + id).html());
		$("#" + id).attr("style", "background:yellow");
	}
	else {
		$("#" + id).removeAttr("style");
		sampleFields.splice(position, 1);
	}
}

function searchField(field) {
	for (let i = 0; i < sampleFields.length; i++) {
		if (sampleFields[i] == field)
			return i;
	}
	return -1;
}

function submitSamples() {
	if (sampleFields.length > 0) {
		let payLoad = JSON.stringify(sampleFields);
		$.ajax({
			type: "POST",
			url: "fragments/receiver-xslx-fragment.jsp",
			data: payLoad,
			success: function() {
				$.get("fragments/xslx-fragment.jsp", (data) => {
					$("#work-area").empty();
					$("#work-area").append(data);
					$("#step-one").hide();
					$("#step-two").show();
				});

			},
		});
	}
}
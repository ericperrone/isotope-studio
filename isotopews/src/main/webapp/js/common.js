var sideBarOn = false;

function toggleSidebar() {
	if (sideBarOn === false) {
		$(".menu-toggler").attr("disabled", "disabled");
		sideBarOn = true;
		$("#sidebaroff").attr("style", "display:none");
		$("#sidebartr").removeAttr("style");
		setTimeout(() => {
			$("#sidebartr").attr("style", "display:none");
			$("#sidebaron").removeAttr("style");
			$(".menu-toggler").removeAttr("disabled");
		}, 1000);
	} else {
		$(".menu-toggler").attr("disabled", "disabled");
		sideBarOn = false;
		$("#sidebartl").removeAttr("style");
		$("#sidebaron").attr("style", "display:none");
		setTimeout(() => {
			$("#sidebartl").attr("style", "display:none");
			$("#sidebaroff").removeAttr("style");
			$(".menu-toggler").removeAttr("disabled");
		}, 1000);
	}
}

function doDataProcessing() {
	$("#work-area").empty();
	let hook = "modal-area";
	openModal(hook, "common/spinner.jsp",
		() => {
			$.get("fragments/xslx-sheet-fragment.jsp", (data) => {
				$("#work-area").append(data);
				closeModal(hook);
				toggleSidebar();
			})
		}
	);
}

function openModal(hook, content, callback) {
	$.get(content, function(data) {
		$(".modal-body").append(data);
		$("#" + hook).modal('show');
		if (callback != null)
			callback();
	});
}

function closeModal(hook) {
	$(".modal-body").empty();
	setTimeout(() => $("#" + hook).modal('hide')
		, 100);
}
const form = document.getElementById('order-lookup-form');
const orderNumberInput = document.getElementById('orderInput');
const submitBtn = document.getElementById('form-btn');
const spinner = document.getElementById('spinner-container');
const tracker = document.getElementById('trackerContainer');
const custDetailsList = document.getElementById('customer-details');

const trackerOrderNumberPlaceholder = document.getElementById(
	'orderNumberPlaceholder'
);

const customerList = document.getElementById('customer-datils-list');
const itemListsWrapper = document.getElementById('item-lists');

const drawingStep = document.getElementById('step-drawing');
const stepCuttingBill = document.getElementById('step-cutting-bill');
const stepManufacturing = document.getElementById('step-manufacturing');
const stepQc = document.getElementById('step-qc');
const stepShipping = document.getElementById('step-shipping');

class classy {
	removeClass = (elm, classname) => elm.classList.remove(classname);
	add = (elm, classname) => elm.classList.add(classname);
	swap = (elm, classToRemove, classToAdd) => {
		this.removeClass(elm, classToRemove);
		this.add(elm, classToAdd);
	};
}

const applyTrackerBarSteps = (boxStatus) => {
	console.log("STATUS", boxStatus)
	const removeIncompleteClassIfTrue = (elm, cond) => {
		if (cond) {
			elm.classList.remove('incomplete');
		}
	};

	//!quote and drawing AKA step 1&2 auto complete so we dont worry about them

	//remove the cutting bill step if there isnt a cutting bill on the job
	if (boxStatus.cuttingBill.status === 'N/A') {
		document.getElementById('step-cutting-bill').outerHTML = ""
	}

	removeIncompleteClassIfTrue(stepManufacturing, boxStatus.Refrigeration.status === "Complete" && boxStatus.manufactuerPanels.status === "Complete")
	removeIncompleteClassIfTrue(stepQc, boxStatus.qualityInspection.status === "Complete")
	removeIncompleteClassIfTrue(stepShipping, boxStatus.shipped.status === "Shipped")
};

const applyDetails = (data) => {
	const { customer, boxes } = data;

	console.log('DATA', data);

	// Handle customer info
	const listITems = Object.entries(customer).reduce((p, [key, val]) => {
		return `${p}<li class="detail-list-item"><div class="bold capitalize">${key}:</div><div class="cust-detail-val">${val}</div></div>`;
	}, '');

	// Handle Boxes
	const ItemLists = boxes
		.map((box) => {
			const listITems = Object.entries(box.status).reduce((p, [key, val]) => {
				if (key === 'skip') return `${p}`;
				return `${p}<li class="detail-list-item"><div class="detail-list-item__name">${val.name}:</div><div class="detail-list-item__status">${val.status}</div></div>`;
			}, '');

			return `<h2 class="detail-item-title">${box.Description}</h2><ul class="detail-list">${listITems}</ul>`;
		}, [])
		.join('');

	customerList.innerHTML = `<ul class="detail-list">${listITems}</ul>`;
	itemListsWrapper.innerHTML = ItemLists;
};

const getQuoteData = async (quoteNumber) => {
	const options = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ quoteNumber }),
	};

	const data = await fetch(
		'http://localhost:3000/getOrder/',
		options
	).catch((err) => console.log(err));

	const r = data.json();
	console.log(r);
	return r;
};

async function handleGetQuote(e) {
	e.preventDefault();

	const quoteNumber = orderNumberInput.value.trim().toLocaleLowerCase();

	if (!quoteNumber) {
		return false;
	}

	//slide down loading spinner
	spinner.classList.remove('push-up');

	//fetch the quote
	const quote = await getQuoteData(quoteNumber);
	console.log(quote)

	// !TODO handle no quote being returned

	console.log(Object.keys(quote));
	//push the spinner back up
	spinner.classList.add('push-up');
	//bring the results down
	tracker.classList.remove('push-up');

	//set the order number in the results header
	trackerOrderNumberPlaceholder.innerHTML = quoteNumber;

	applyDetails(quote);
	applyTrackerBarSteps(quote.boxes[0].status)

	//
}

// Handle Order Close
$('#tracker-close-btn').on('click', function () {
	tracker.classList.add('push-up');
	//   spinner.classList.remove('push-down')
	//   spinner.classList.add('push-up')
});

submitBtn.addEventListener('click', handleGetQuote);

$(document).on('ready', function () {
	// Animate when in view.
	let callback = (entries, observer) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				const classToAdd = entry.target.dataset.obs;
				console.log('Class to add', classToAdd);
				entry.target.classList.add(classToAdd);
			}
			// Each entry describes an intersection change for one observed
			// target element:
			//   entry.boundingClientRect
			//   entry.intersectionRatio
			//   entry.intersectionRect
			//   entry.isIntersecting
			//   entry.rootBounds
			//   entry.target
			//   entry.time
		});
	};
	let observer = new IntersectionObserver(callback, (options = {}));
	let target = document.querySelectorAll('[data-obs]');
});

$('.slide').slick({
	lazyLoad: 'ondemand',
	// speed: 500,
	slidesToShow: 1,
	slidesToScroll: 1,
	autoplay: true,
	autoplaySpeed: 5000,
	dots: true,
});

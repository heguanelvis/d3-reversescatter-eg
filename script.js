d3.json("data/chicago_rat_community_17.json")
    .then(data => {
        const sampleData = data.filter(e => e.population > 35500)
        const margin = { left: 50, right: 75, top: 125, bottom: 50 }
        const width = 1000;
        const height = 900;

        let canvas = d3.select("#chart")
            .append("svg")
            .attr("class", "svg-center")
            .attr("width", width)
            .attr("height", height)

        const chart = new Chart(sampleData, canvas, width, height, margin);
        chart.scatterPlot();

        responsivefy(chart.canvas)
    })
    .catch(err => {
        alert("Something went wrong...");
        console.log(err);
    });

class Chart {
    constructor(data, canvas, width, height, margin) {
        this.data = data;
        this.canvas = canvas;
        this.width = width;
        this.height = height;
        this.margin = margin;
        this.graphWidth = this.width - this.margin.left - this.margin.right;
        this.graphHeight = this.height - this.margin.top - this.margin.bottom;
    }

    graphSetup() {
        this.graph = this.canvas.append("g")
            .attr("tranform", () => `translate(${this.margin.left}, ${this.margin.top})`);
    }

    graphScales() {
        const incomeMax = d3.max(this.data, d => d.income);
        const complaintsMax = d3.max(this.data, d => d.complaints);
        this.x = d3.scaleLinear()
            .domain([0, incomeMax])
            .range([this.graphWidth + this.margin.left, this.margin.left])
            .nice()

        this.y = d3.scaleLinear()
            .domain([0, complaintsMax])
            .range([this.margin.top, this.graphHeight + this.margin.top])
            .nice()
    }

    graphCircles() {
        let circles = this.graph.selectAll("circle")
            .data(this.data)
            .enter()
            .append("circle")
            .attr("class", d => d.renter > 0.611 ? "renter-circles pointer" : "circles pointer")
            .attr("r", 0)
            .attr("cx", d => this.x(d.income))
            .attr("cy", d => this.y(d.complaints))
            
        circles.transition()
            .duration(3000)
            .attr("r", 10)

        circles.on("mouseover", this.handleMouseOver.bind(this))
            .on("mouseout", this.handleMouseOut)
    }

    graphAxes() {
        const xAxisGroup = this.graph.append("g")
            .attr("transform", `translate(0, ${this.margin.top})`);

        const yAxisGroup = this.graph.append("g")
            .attr("transform", `translate(${this.graphWidth + this.margin.left}, 0)`);

        const xAxis = d3.axisTop(this.x);
        const yAxis = d3.axisRight(this.y);

        xAxisGroup.call(xAxis)
            .attr("class", "ticks");
        yAxisGroup.call(yAxis)
            .attr("class", "ticks");
    }

    graphAxesLabel() {
        this.graph.append("text")
            .text("Average Income Per Capita")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(${this.width / 2}, ${this.margin.top / 1.35})`)
            .attr("font-size", "14")
        this.graph.append("text")
            .text("Complaint Count")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(${this.width - this.margin.right / 6}, ${this.height / 1.7})rotate(-90)`)
            .attr("font-size", "14")
    }

    graphAxesInfo() {
        this.graph.append("text")
            .text("Communities with lower Income and More Renters Less Likely to See Rat Complaints (2017)")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(${this.width / 2}, ${this.margin.top / 3})`)
            .attr("font-size", "20")
        this.graph.append("text")
            .text("Relationship between income and rat complaints within 30 most populous Chicago Communities")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(${this.width / 2}, ${this.margin.top / 1.9})`)
            .attr("font-size", "16")
        this.graph.append("text")
            .html(() => "Source: <a class='source' href='https://api.census.gov/data/2016/acs/acs5/variables.html'>American Community Survey</a> & <a class='source' href='https://data.cityofchicago.org/Service-Requests/311-Service-Requests-Rodent-Baiting-No-Duplicates/uqhs-j723'>Chicago Data Portal</a>")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(${this.width / 1.38}, ${this.height - this.margin.bottom / 2})`)
            .attr("font-size", "14")
    }

    graphLegend() {
        const legendGroup = this.graph.append("g")
            .attr("transform", `translate(${this.width / 12}, ${this.height - this.margin.bottom * 5})`);

        legendGroup.append("text")
            .transition()
            .duration(3000)
                .text("Renter Proportion <= 0.6")
                .attr("transform", `translate(25, 13)`)
                .attr("font-size", "14")

        legendGroup.append("rect")
            .transition()
            .duration(3000)
                .attr("width", 15)
                .attr("height", 15)
                .attr("x", 0)
                .attr("y", 0)
                .attr("class", "circles")

        legendGroup.append("text")
            .transition()
            .duration(3000)
                .text("Renter Proportion > 0.6")
                .attr("transform", `translate(25, 43)`)
                .attr("font-size", "14")

        legendGroup.append("rect")
            .transition()
            .duration(3000)
                .attr("width", 15)
                .attr("height", 15)
                .attr("x", 0)
                .attr("y", 30)
                .attr("class", "renter-circles")
    }

    handleMouseOver(d, i, n) {
        d3.select(n[i])
            .attr("r", 12.5)
            .attr("stroke", "#af7156")
            .attr("stroke-width", 3);

        this.graph.append("text")
            .attr("id", `t-${d.income}-${d.complaints}-${i}`)
            .attr("x", () => this.x(d.income - 1600))
            .attr("y", () => this.y(d.complaints))
            .text(() => d.community)
            .attr("font-size", "14")
    }

    handleMouseOut(d, i, n) {
        d3.select(this)
            .attr("r", 10)
            .attr("stroke", "white")
            .attr("stroke-width", 0);

        d3.select(`#t-${d.income}-${d.complaints}-${i}`)
        .remove();
    }

    scatterPlot() {
        this.graphSetup();
        this.graphScales();
        this.graphCircles();
        this.graphAxes();
        this.graphAxesLabel();
        this.graphAxesInfo();
        this.graphLegend();
    }
}

function responsivefy(svg) {
    const container = d3.select(svg.node().parentNode),
        width = parseInt(svg.style("width")),
        height = parseInt(svg.style("height")),
        aspect = width / height;

    svg.attr("viewBox", `0 0 ${width} ${height}`)
        .attr("perserveAspectRatio", "xMinYMid")
        .call(resize);

    d3.select(window).on(`resize.${container.attr("id")}`, resize);

    function resize() {
        var targetWidth = parseInt(container.style("width"));
        svg.attr("width", targetWidth - 30);
        svg.attr("height", Math.round(targetWidth / aspect));
    }
}
var documenterSearchIndex = {"docs":
[{"location":"MeshData/#MeshData-type","page":"MeshData","title":"MeshData type","text":"","category":"section"},{"location":"MeshData/","page":"MeshData","title":"MeshData","text":"MeshData contains the following fields","category":"page"},{"location":"MeshData/","page":"MeshData","title":"MeshData","text":"K: number of elements K in the mesh.\nFToF: indexing vector for face-to-face connectivity (length of the vector is the total number of faces, e.g., N_rm faces K)\nxyz::NTuple{Dim,...}: nodal interpolation points mapped to physical elements. All elements of xyz are N_p times K matrices, where N_p are the number of nodal points on each element.\nxyzq::NTuple{Dim,...}, wJq: volume quadrature points/weights mapped to physical elements. All elements these tuples are N_q times K matrices, where N_q is the number of quadrature points on each element.\nxyzf::NTuple{Dim,...}: face quadrature points mapped to physical elements. All elements of xyz are N_f times K matrices, where N_f is the number of face points on each element.\nmapP,mapB: indexing arrays for inter-element node connectivity (mapP) and for extracting boundary nodes from the list of face nodes xyzf (mapB). mapP is a matrix of size N_f times K, while the length of mapB is the total number of nodes on the boundary.\nrstxyzJ::SMatrix{Dim,Dim}: volume geometric terms G_ij = fracpartal x_ipartial hatx_j. Each element of rstxyzJ is a matrix of size N_p times K.\nJ,sJ: volume and surface Jacobians evaluated at interpolation points and surface quadrature points, respectively. J is a matrix of size N_p times K, while sJ is a matrix of size N_f times K.\nnxyzJ::NTuple{Dim,...}: scaled outward normals evaluated at surface quadrature points. Each element of nxyzJ is a matrix of size N_ftimes K.","category":"page"},{"location":"MeshData/#Setting-up-md::MeshData","page":"MeshData","title":"Setting up md::MeshData","text":"","category":"section"},{"location":"MeshData/","page":"MeshData","title":"MeshData","text":"The MeshData struct contains data for high order DG methods useful for evaluating DG formulations in a matrix-free fashion.","category":"page"},{"location":"MeshData/#Generating-unstructured-meshes","page":"MeshData","title":"Generating unstructured meshes","text":"","category":"section"},{"location":"MeshData/","page":"MeshData","title":"MeshData","text":"For convenience, simple uniform meshes are included in with StartUpDG.jl via uniform_mesh","category":"page"},{"location":"MeshData/","page":"MeshData","title":"MeshData","text":"using StartUpDG\nKx,Ky,Kz = 4,2,8\nVX,EToV = uniform_mesh(Line(),Kx)\nVX,VY,EToV = uniform_mesh(Tri(),Kx,Ky)\nVX,VY,EToV = uniform_mesh(Quad(),Kx,Ky)\nVX,VY,VZ,EToV = uniform_mesh(Hex(),Kx,Ky,Kz)","category":"page"},{"location":"MeshData/","page":"MeshData","title":"MeshData","text":"The uniform triangular mesh is constructed by creating a uniform quadrilateral mesh then bisecting each quad into two triangles.","category":"page"},{"location":"MeshData/#Initializing-high-order-DG-mesh-data","page":"MeshData","title":"Initializing high order DG mesh data","text":"","category":"section"},{"location":"MeshData/","page":"MeshData","title":"MeshData","text":"Given unstructured mesh information (tuple of vertex coordinates VXYZ and index array EToV) high order DG mesh data can be constructed as follows:","category":"page"},{"location":"MeshData/","page":"MeshData","title":"MeshData","text":"md = MeshData(VXYZ...,EToV,rd)","category":"page"},{"location":"MeshData/#Enforcing-periodic-boundary-conditions","page":"MeshData","title":"Enforcing periodic boundary conditions","text":"","category":"section"},{"location":"MeshData/","page":"MeshData","title":"MeshData","text":"Periodic boundary conditions can be enforced by calling make_periodic, which returns another MeshData struct with modified mapP,mapB, and FToF indexing arrays which account for periodicity.","category":"page"},{"location":"MeshData/","page":"MeshData","title":"MeshData","text":"md = MeshData(VX,VY,EToV,rd)\nmd_periodic = make_periodic(md,rd) # periodic in both x and y coordinates\nmd_periodic_x = make_periodic(md,rd,true,false) # periodic in x direction, but not y","category":"page"},{"location":"MeshData/","page":"MeshData","title":"MeshData","text":"One can check which dimensions are periodic via the is_periodic field of MeshData. For example, the md_periodic_x example above gives","category":"page"},{"location":"MeshData/","page":"MeshData","title":"MeshData","text":"julia> md_periodic_x.is_periodic\n(true, false)","category":"page"},{"location":"MeshData/#Creating-curved-meshes","page":"MeshData","title":"Creating curved meshes","text":"","category":"section"},{"location":"MeshData/","page":"MeshData","title":"MeshData","text":"It's common to generate curved meshes by first generating a linear mesh, then moving high order nodes on the linear mesh. This can be done by calling MeshData again with new x,y coordinates:","category":"page"},{"location":"MeshData/","page":"MeshData","title":"MeshData","text":"md = MeshData(VX,VY,EToV,rd)\n@unpack x,y = md\n# <-- code to modify high order nodes (x,y)\nmd_curved = MeshData(md,rd,x,y)","category":"page"},{"location":"MeshData/","page":"MeshData","title":"MeshData","text":"MeshData(md,rd,x,y) and MeshData(md,rd,x,y,z) are implemented for 2D and 3D, though this is not currently implemented in 1D.","category":"page"},{"location":"MeshData/","page":"MeshData","title":"MeshData","text":"More generally, one can create a copy of a MeshData with certain fields modified by using @set or setproperties from Setfield.jl.","category":"page"},{"location":"MeshData/#Unstructured-triangular-meshes-using-Triangulate","page":"MeshData","title":"Unstructured triangular meshes using Triangulate","text":"","category":"section"},{"location":"MeshData/","page":"MeshData","title":"MeshData","text":"If Triangulate is also loaded, then StartUpDG will includes a few additional utilities for creating and visualizing meshes. ","category":"page"},{"location":"RefElemData/#RefElemData-type","page":"RefElemData","title":"RefElemData type","text":"","category":"section"},{"location":"RefElemData/","page":"RefElemData","title":"RefElemData","text":"RefElemData contains the following fields","category":"page"},{"location":"RefElemData/","page":"RefElemData","title":"RefElemData","text":"elemShape::ElemShape: element shape. Line, Tri, Quad, Hex currently supported.\napproxType: approximation type. Defaults to Polynomial(), but SBP() is also supported (see RefElemData based on SBP finite differences).\nNfaces: number of faces on a given type of reference element.\nfv: list of vertices defining faces, e.g., [1,2],[2,3],[3,1] for a triangle\nrst::NTuple{Dim,...}: tuple of vectors of length N_p, each of which contains coordinates of degree N optimized polynomial interpolation points.\nrstq::NTuple{Dim,...},wq,Vq: tuple of volume quadrature points, vector of weights, and quadrature interpolation matrix. Each element of rstq and wq are vectors of length N_q, and Vq is a matrix of size N_q times N_p.\nN_{\\rm plot}: the degree which determines the number of plotting points N_{p,{\\rm plot}}.\nrstp::NTuple{Dim,...}, Vp: tuple of plotting points and plotting interpolation matrix. Each element of rstp is a vector of length N_prm plot, and Vp is a matrix of size N_prm plot times N_p.\nrstf::NTuple{Dim,...},wf,Vf: tuple of face quadrature points, weights, and face interpolation matrix. Each element of rstf and wf are vectors of length N_f, and Vf is a matrix of size N_f times N_p.\nnrstJ::NTuple{Dim,...}: tuple of outward reference normals, scaled by face Jacobian. Each element is a vector of length N_f.\nM: mass matrix computed using quadrature. Size N_p times N_p\nPq: quadrature-based L^2 projection matrix. Size N_p times N_q.\nDrst::NTuple{Dim,...}, LIFT: differentiation and lifting matrices. Differentiation matrices are size N_p times N_p, while lift matrices are size N_ptimes N_f.","category":"page"},{"location":"RefElemData/","page":"RefElemData","title":"RefElemData","text":"This list is incomplete; other fields are stored or accessible but currently only used for internal computations.","category":"page"},{"location":"RefElemData/","page":"RefElemData","title":"RefElemData","text":"Mass, differentiation, lifting, and interpolation matrices specialize on the type of matrix. For example, these matrices are dense Matrix{T} type for lines and triangles, but might be stored as sparse matrices for quadrilaterals and hexahedra.","category":"page"},{"location":"RefElemData/#Setting-up-rd::RefElemData","page":"RefElemData","title":"Setting up rd::RefElemData","text":"","category":"section"},{"location":"RefElemData/","page":"RefElemData","title":"RefElemData","text":"The struct rd::RefElemData contains data for a given element type. Currently, four types of reference elements are supported: Line, Tri, Quad, and Hex.","category":"page"},{"location":"RefElemData/","page":"RefElemData","title":"RefElemData","text":"To initalize a RefElemData, just specify the element type and polynomial degree.","category":"page"},{"location":"RefElemData/","page":"RefElemData","title":"RefElemData","text":"N = 3\nrd = RefElemData(Line(),N)\nrd = RefElemData(Tri(),N)\nrd = RefElemData(Quad(),N)\nrd = RefElemData(Hex(),N)","category":"page"},{"location":"RefElemData/#Specifying-different-quadrature-rules.","page":"RefElemData","title":"Specifying different quadrature rules.","text":"","category":"section"},{"location":"RefElemData/","page":"RefElemData","title":"RefElemData","text":"By default, RefElemData initializes volume and surface quadrature rules to be the minimum rules which exactly integrate the unweighted volume and surface mass matrices. If different quadrature rules are desired, they can be specified as follows:","category":"page"},{"location":"RefElemData/","page":"RefElemData","title":"RefElemData","text":"N = 3\n\n# create degree N tensor product Gauss-Lobatto rule\nr1D,w1D = gauss_lobatto_quad(0,0,N)\nrq,sq = vec.(StartUpDG.meshgrid(r1D))\nwr,ws = vec.(StartUpDG.meshgrid(w1D))\nwq = @. wr*ws\n\nrd = RefElemData(Quad(),N; quad_rule_vol =(rq,sq,wq),  \n                           quad_rule_face=(r1D,w1D))","category":"page"},{"location":"RefElemData/","page":"RefElemData","title":"RefElemData","text":"This results in a DG spectral element method (DG-SEM) discretization, with a diagonal lumped mass matrix and differentiation matrices which satisfy a summation-by-parts property.","category":"page"},{"location":"RefElemData/","page":"RefElemData","title":"RefElemData","text":"By default, RefElemData is constructed for a nodal basis (in order to facilitate curved meshes, connectivity, etc). There is not functionality to change interpolation nodes, since these transformations can be performed as algebraic changes of basis after setting up a RefElemData. ","category":"page"},{"location":"RefElemData/#RefElemData-based-on-SBP-finite-differences","page":"RefElemData","title":"RefElemData based on SBP finite differences","text":"","category":"section"},{"location":"RefElemData/","page":"RefElemData","title":"RefElemData","text":"It is also possible to construct a RefElemData based on multi-dimensional SBP finite difference operators. These utilize nodes constructed by Tianheng Chen and Chi-Wang Shu, Ethan Kubatko, and Jason Hicken.","category":"page"},{"location":"RefElemData/","page":"RefElemData","title":"RefElemData","text":"Some examples:","category":"page"},{"location":"RefElemData/","page":"RefElemData","title":"RefElemData","text":"rd = RefElemData(Tri(), SBP(), 2)\nrd = RefElemData(Quad(), SBP(), 2)\nrd = RefElemData(Tri(), SBP(), 2; quadrature_strength=4, quad_rule_face=:Legendre) ","category":"page"},{"location":"RefElemData/","page":"RefElemData","title":"RefElemData","text":"Quadrature rules of both degree 2*N-1 (up to N=6) and 2*N (up to N=4) are supported on triangles. For Line, Quad, and Hex elements, RefElemData(...,SBP(),N) is the same as the RefElemData for a DG-SEM discretization, though some fields are specialized for the SBP type. ","category":"page"},{"location":"RefElemData/","page":"RefElemData","title":"RefElemData","text":"These SBP-based RefElemData objects can also be used to initialize a mesh (for example, md = MeshData(uniform_mesh(rd.elementType,4)...,rd)). ","category":"page"},{"location":"tstep_usage/#Time-stepping","page":"Timestepping","title":"Time-stepping","text":"","category":"section"},{"location":"tstep_usage/","page":"Timestepping","title":"Timestepping","text":"For convenience, we include utilities for two explicit Runge-Kutta schemes. For more advanced time-stepping functionality, we recommend DifferentialEquations.jl.","category":"page"},{"location":"tstep_usage/#Carpenter-and-Kennedy's-(4,5)-method","page":"Timestepping","title":"Carpenter and Kennedy's (4,5) method","text":"","category":"section"},{"location":"tstep_usage/","page":"Timestepping","title":"Timestepping","text":"ck45() returns coefficients for a low-storage Runge-Kutta method.","category":"page"},{"location":"tstep_usage/#Example-usage:","page":"Timestepping","title":"Example usage:","text":"","category":"section"},{"location":"tstep_usage/","page":"Timestepping","title":"Timestepping","text":"using Plots\nusing StartUpDG\n\n# Brusselator\nB = 3\nf(y1,y2) = [1+y1^2*y2-(B+1)*y1, B*y1-y1^2*y2]\nf(Q) = f(Q[1],Q[2])\np,q = 1.5, 3.0\nQ = [p;q]\n\ndt = .1\nFinalTime = 20\n\nres = zero.(Q) # init RK residual\nrk4a,rk4b,rk4c = ck45()\nNsteps = ceil(FinalTime/dt)\ndt = FinalTime/Nsteps\n\nplot() # init plot\nfor i = 1:Nsteps\n    global res # yes, I know...this is just for simplicty\n    for INTRK=1:5\n        rhsQ = f(Q)\n        @. res = rk4a[INTRK]*res + dt*rhsQ # i = RK stage\n        @. Q =  Q + rk4b[INTRK]*res\n    end\n    scatter!([i*dt;i*dt],Q)\nend\ndisplay(plot!(leg=false))","category":"page"},{"location":"index_refs/#Index","page":"Reference","title":"Index","text":"","category":"section"},{"location":"index_refs/","page":"Reference","title":"Reference","text":"","category":"page"},{"location":"index_refs/#Functions","page":"Reference","title":"Functions","text":"","category":"section"},{"location":"index_refs/","page":"Reference","title":"Reference","text":"Modules = [StartUpDG]","category":"page"},{"location":"index_refs/#StartUpDG.MeshData","page":"Reference","title":"StartUpDG.MeshData","text":"struct MeshData{Dim, Tv, Ti}\n\nMeshData: contains info for a high order piecewise polynomial discretization on an unstructured mesh. \n\nUse @unpack to extract fields. Example:\n\nN,K1D = 3,2\nrd = RefElemData(Tri(),N)\nVX,VY,EToV = uniform_mesh(Tri(),K1D)\nmd = MeshElemData(VX,VY,EToV,rd)\n@unpack x,y = md\n\n\n\n\n\n","category":"type"},{"location":"index_refs/#StartUpDG.MeshPlotter","page":"Reference","title":"StartUpDG.MeshPlotter","text":"MeshPlotter(VX,VY,EToV,fv)\nMeshPlotter(triout::TriangulateIO)\n\nPlot recipe to plot a quadrilateral or triangular mesh. Usage: plot(MeshPlotter(...))\n\n\n\n\n\n","category":"type"},{"location":"index_refs/#StartUpDG.RefElemData","page":"Reference","title":"StartUpDG.RefElemData","text":"struct RefElemData{Dim, ElemShape <: AbstractElemShape, Nfaces, Tv}\n\nRefElemData: contains info (interpolation points, volume/face quadrature, operators) for a high order nodal basis on a given reference element. \n\nUse @unpack to extract fields. Example:\n\nN = 3\nrd = RefElemData(Tri(),N)\n@unpack r,s = rd\n\n\n\n\n\n","category":"type"},{"location":"index_refs/#StartUpDG.RefElemData-Tuple{Any}","page":"Reference","title":"StartUpDG.RefElemData","text":"function RefElemData(elem; N, kwargs...)\nfunction RefElemData(elem, approxType; N, kwargs...)\n\nKeyword argument constructor for RefElemData (to \"label\" N via rd = RefElemData(Line(),N=3))\n\n\n\n\n\n","category":"method"},{"location":"index_refs/#StartUpDG.RefElemData-Tuple{Hex, SBP, Any}","page":"Reference","title":"StartUpDG.RefElemData","text":"function RefElemData(elementType::Quad, approxType::SBP, N)\n\nSBP reference element data for DGSEM. \n\n\n\n\n\n","category":"method"},{"location":"index_refs/#StartUpDG.RefElemData-Tuple{Line, Polynomial, Any}","page":"Reference","title":"StartUpDG.RefElemData","text":"RefElemData(elem::Line, N;\n            quad_rule_vol = quad_nodes(elem,N+1))\nRefElemData(elem::Union{Tri,Quad}, N;\n             quad_rule_vol = quad_nodes(elem,N),\n             quad_rule_face = gauss_quad(0,0,N))\nRefElemData(elem::Hex,N;\n             quad_rule_vol = quad_nodes(elem,N),\n             quad_rule_face = quad_nodes(Quad(),N))\nRefElemData(elem; N, kwargs...) # version with keyword arg\n\nConstructor for RefElemData for different element types.\n\n\n\n\n\n","category":"method"},{"location":"index_refs/#StartUpDG.RefElemData-Tuple{Quad, SBP, Any}","page":"Reference","title":"StartUpDG.RefElemData","text":"function RefElemData(elementType::Quad, approxType::SBP, N)\n\nSBP reference element data for DGSEM. \n\n\n\n\n\n","category":"method"},{"location":"index_refs/#StartUpDG.RefElemData-Tuple{Tri, SBP, Any}","page":"Reference","title":"StartUpDG.RefElemData","text":"function RefElemData(elementType::Tri, approxType::SBP, N; kwargs...)\n\nkwargs = quadraturestrength=2N-1 (or 2N), quadrule_face=:Lobatto (or :Legendre)\n\n\n\n\n\n","category":"method"},{"location":"index_refs/#StartUpDG.boundary_face_centroids-Tuple{Any}","page":"Reference","title":"StartUpDG.boundary_face_centroids","text":"function boundary_face_centroids(md)\n\nReturns face centroids and boundary_face_ids on the boundaries of the domain given by md::MeshData.\n\n\n\n\n\n","category":"method"},{"location":"index_refs/#StartUpDG.ck45-Tuple{}","page":"Reference","title":"StartUpDG.ck45","text":"ck45()\n\nReturns coefficients rka,rkb,rkc for the 4th order 5-stage low storage Carpenter/Kennedy Runge Kutta method. Coefficients evolve the residual, solution, and local time, e.g.,\n\nExample\n\nres = rk4a[i]*res + dt*rhs # i = RK stage\n@. u += rk4b[i]*res\n\n\n\n\n\n","category":"method"},{"location":"index_refs/#StartUpDG.connect_mesh-Tuple{Any, Any}","page":"Reference","title":"StartUpDG.connect_mesh","text":"connect_mesh(EToV,fv)\n\nInitialize element connectivity matrices, element to element and element to face connectivity.\n\nInputs:\n\nEToV is a K by Nv matrix whose rows identify the Nv vertices\n\nwhich make up an element.\n\nfv (an array of arrays containing unordered indices of face vertices).\n\nOutput: FToF, length(fv) by K index array containing face-to-face connectivity.\n\n\n\n\n\n","category":"method"},{"location":"index_refs/#StartUpDG.diagE_sbp_nodes-Tuple{Tri, Any}","page":"Reference","title":"StartUpDG.diagE_sbp_nodes","text":"Triangular SBP nodes with diagonal boundary matrices. Nodes from Hicken 2019\n\n\n\n\n\n","category":"method"},{"location":"index_refs/#StartUpDG.estimate_h-Union{Tuple{DIM}, Tuple{RefElemData{DIM, ElemShape, ApproximationType, Nfaces, Tv, VQ, VF, MM, P, D, L} where {ElemShape<:AbstractElemShape, ApproximationType, Nfaces, Tv, VQ, VF, MM, P, D, L}, MeshData{DIM, Tv, Ti} where {Tv, Ti}}} where DIM","page":"Reference","title":"StartUpDG.estimate_h","text":"estimate_h(rd::RefElemData,md::MeshData)\n\nEstimates the mesh size via min sizeofdomain * |J|/|sJ|, since |J| = O(hᵈ) and |sJ| = O(hᵈ⁻¹). \n\n\n\n\n\n","category":"method"},{"location":"index_refs/#StartUpDG.hybridized_SBP_operators-Tuple{Any}","page":"Reference","title":"StartUpDG.hybridized_SBP_operators","text":"function hybridized_SBP_operators(rd::RefElemData{DIMS})\n\nConstructs hybridized SBP operators given a RefElemData. Returns operators Qrsth...,VhP,Ph.\n\n\n\n\n\n","category":"method"},{"location":"index_refs/#StartUpDG.inverse_trace_constant-Tuple{RefElemData{1, ElemShape, ApproximationType, Nfaces, Tv, VQ, VF, MM, P, D, L} where {ElemShape<:AbstractElemShape, ApproximationType, Nfaces, Tv, VQ, VF, MM, P, D, L}}","page":"Reference","title":"StartUpDG.inverse_trace_constant","text":"function inverse_trace_constant(rd::RefElemData)\n\nReturns the degree-dependent constant in the inverse trace equality over the reference element (as  reported in \"GPU-accelerated dG methods on hybrid meshes\" by Chan, Wang, Modave, Remacle, Warburton 2016). \n\nCan be used to estimate dependence of maximum stable timestep on degree of approximation. \n\n\n\n\n\n","category":"method"},{"location":"index_refs/#StartUpDG.readGmsh2D-Tuple{Any}","page":"Reference","title":"StartUpDG.readGmsh2D","text":"function readGmsh2D(filename)\n\nreads triangular GMSH 2D file format 2.2 0 8. returns VX,VY,EToV\n\nExamples\n\nVXY,EToV = readGmsh2D(\"eulerSquareCylinder2D.msh\")\n\n\n\n\n\n","category":"method"},{"location":"index_refs/#StartUpDG.tag_boundary_faces-Tuple{Any, Nothing}","page":"Reference","title":"StartUpDG.tag_boundary_faces","text":"function tag_boundary_faces(md,boundary_name::Symbol=:entire_boundary)\nfunction tag_boundary_faces(md,boundary_list::Dict{Symbol,<:Function})\n\nWhen called without arguments, just returns Dict(:entireboundary=>boundaryfaces).\n\nExample usage: \n\njulia> rd = RefElemData(Tri(),N=1)\njulia> md = MeshData(uniform_mesh(Tri(),2)...,rd)\njulia> on_bottom_boundary(x,y,tol=1e-13) = abs(y+1) < tol\njulia> on_top_boundary(x,y,tol=1e-13) = abs(y-1) < tol\njulia> determine_boundary_faces(Dict(:bottom => on_bottom_boundary,\n                                     :top    => on_top_boundary), md)\n\n\n\n\n\n","category":"method"},{"location":"index_refs/#StartUpDG.uniform_mesh-Tuple{Line, Any}","page":"Reference","title":"StartUpDG.uniform_mesh","text":"    uniform_mesh(elem::Line,Kx)\n    uniform_mesh(elem::Tri,Kx,Ky)\n    uniform_mesh(elem::Quad,Kx,Ky)\n    uniform_mesh(elem::Hex,Kx,Ky,Kz)\n\nUniform Kx (by Ky by Kz) mesh on -11^d, where d is the spatial dimension. Returns VX,VY,VZ,EToV. Can also use kwargs via uniform_mesh(elem; K1D=16)\n\n\n\n\n\n","category":"method"},{"location":"ex_dg_deriv/#Example:-approximating-derivatives-using-DG","page":"Example: computing DG derivatives","title":"Example: approximating derivatives using DG","text":"","category":"section"},{"location":"ex_dg_deriv/","page":"Example: computing DG derivatives","title":"Example: computing DG derivatives","text":"MeshData can be used to compute DG derivatives. Suppose f is a differentiable function and the domain Omega can be decomposed into non-overlapping elements D^k. The approximation of fracpartial fpartial x can be approximated using the following formulation: find piecewise polynomial u such that for all piecewise polynomials v","category":"page"},{"location":"ex_dg_deriv/","page":"Example: computing DG derivatives","title":"Example: computing DG derivatives","text":"int_Omega u v = sum_k left( int_D^k fracpartial upartial xv + int_partial D^k frac12 lefturightn_x v right)","category":"page"},{"location":"ex_dg_deriv/","page":"Example: computing DG derivatives","title":"Example: computing DG derivatives","text":"Here, lefturight = u^+ - u denotes the jump across an element interface, and n_x is the x-component of the outward unit normal on D^k.","category":"page"},{"location":"ex_dg_deriv/","page":"Example: computing DG derivatives","title":"Example: computing DG derivatives","text":"Discretizing the left-hand side of this formulation yields a mass matrix. Inverting this mass matrix to the right hand side yields the DG derivative. We show how to compute it for a uniform triangular mesh using MeshData and StartUpDG.jl.","category":"page"},{"location":"ex_dg_deriv/","page":"Example: computing DG derivatives","title":"Example: computing DG derivatives","text":"We first construct the triangular mesh and initialize md::MeshData.","category":"page"},{"location":"ex_dg_deriv/","page":"Example: computing DG derivatives","title":"Example: computing DG derivatives","text":"using StartUpDG\nusing Plots\n\nN = 3\nK1D = 8\nrd = RefElemData(Tri(),N)\nVX,VY,EToV = uniform_mesh(Tri(),K1D)\nmd = MeshData(VX,VY,EToV,rd)","category":"page"},{"location":"ex_dg_deriv/","page":"Example: computing DG derivatives","title":"Example: computing DG derivatives","text":"We can approximate a function f(xy) using interpolation","category":"page"},{"location":"ex_dg_deriv/","page":"Example: computing DG derivatives","title":"Example: computing DG derivatives","text":"f(x,y) = exp(-5*(x^2+y^2))*sin(1+pi*x)*sin(2+pi*y)\n@unpack x,y = md\nu = @. f(x,y)","category":"page"},{"location":"ex_dg_deriv/","page":"Example: computing DG derivatives","title":"Example: computing DG derivatives","text":"or using quadrature-based projection","category":"page"},{"location":"ex_dg_deriv/","page":"Example: computing DG derivatives","title":"Example: computing DG derivatives","text":"@unpack Pq = rd\n@unpack x,y,xq,yq = md\nu = Pq*f.(xq,yq)","category":"page"},{"location":"ex_dg_deriv/","page":"Example: computing DG derivatives","title":"Example: computing DG derivatives","text":"We can use scatter in Plots.jl to quickly visualize the approximation. This is not intended to create a high quality image (see other libraries, e.g., Makie.jl,VTK.jl, or Triplot.jl for publication-quality images).","category":"page"},{"location":"ex_dg_deriv/","page":"Example: computing DG derivatives","title":"Example: computing DG derivatives","text":"@unpack Vp = rd\nxp,yp,up = Vp*x,Vp*y,Vp*u # interp to plotting points\nscatter(xp,yp,uxp,zcolor=uxp,msw=0,leg=false,ratio=1,cam=(0,90))","category":"page"},{"location":"ex_dg_deriv/","page":"Example: computing DG derivatives","title":"Example: computing DG derivatives","text":"Both interpolation and projection create a matrix u of size N_p times K which contains coefficients (nodal values) of the DG polynomial approximation to f(xy). We can approximate the derivative of f(xy) using the DG derivative formulation","category":"page"},{"location":"ex_dg_deriv/","page":"Example: computing DG derivatives","title":"Example: computing DG derivatives","text":"function dg_deriv_x(u,md::MeshData,rd::RefElemData)\n  @unpack Vf,Dr,Ds,LIFT = rd\n  @unpack rxJ,sxJ,J,nxJ,mapP = md\n  uf = Vf*u\n  ujump = uf[mapP]-uf\n\n  # derivatives using chain rule + lifted flux terms\n  ux = rxJ.*(Dr*u) + sxJ.*(Ds*u)  \n  dudxJ = ux + LIFT*(.5*ujump.*nxJ)\n\n  return dudxJ./J\nend","category":"page"},{"location":"ex_dg_deriv/","page":"Example: computing DG derivatives","title":"Example: computing DG derivatives","text":"We can visualize the result as follows:","category":"page"},{"location":"ex_dg_deriv/","page":"Example: computing DG derivatives","title":"Example: computing DG derivatives","text":"dudx = dg_deriv_x(u,md,rd)\nuxp = Vp*dudx\nscatter(xp,yp,uxp,zcolor=uxp,msw=0,leg=false,ratio=1,cam=(0,90))","category":"page"},{"location":"ex_dg_deriv/","page":"Example: computing DG derivatives","title":"Example: computing DG derivatives","text":"Plots of the polynomial approximation u(xy) and the DG approximation of fracpartial upartial x are given below","category":"page"},{"location":"ex_dg_deriv/","page":"Example: computing DG derivatives","title":"Example: computing DG derivatives","text":"(Image: u) (Image: dudx)  ⠀","category":"page"},{"location":"authors/#Authors","page":"Authors","title":"Authors","text":"","category":"section"},{"location":"authors/","page":"Authors","title":"Authors","text":"The original port from Matlab to Julia was done by Yimin Lin. Subsequent development was done by Jesse Chan.","category":"page"},{"location":"#Overview","page":"Home","title":"Overview","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"This package contains routines to initialize reference element operators, physical mesh arrays, and connectivities for nodal DG methods. Codes roughly based on Nodal Discontinuous Galerkin Methods by Hesthaven and Warburton (2007).","category":"page"},{"location":"","page":"Home","title":"Home","text":"StartUpDG.jl exports structs RefElemData{Dim,ElemShape,...} and MeshData{Dim} which contain data useful for evaluating DG formulations in a matrix-free fashion. These structs contain fields similar to those in Globals1D, Globals2D, Globals3D in the NDG book codes.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Fields can be unpacked from rd::RefElemData and md::MeshData using @unpack.","category":"page"},{"location":"#A-short-example","page":"Home","title":"A short example","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"using StartUpDG\nusing UnPack\n\n# polynomial degree and mesh size\nN = 3\nK1D = 8\n\n# init ref element and mesh\nrd = RefElemData(Tri(),N)\nVX,VY,EToV = uniform_mesh(Tri(),K1D)\nmd = MeshData(VX,VY,EToV,rd)\n\n# Define a function by interpolation\n@unpack x,y = md\nu = @. exp(-10*(x^2+y^2))\n\n# Compute derivatives using geometric mapping + chain rule\n@unpack Dr,Ds = rd\n@unpack rxJ,sxJ,J = md\ndudx = (rxJ.*(Dr*u) + sxJ.*(Ds*u))./J","category":"page"}]
}

"""
    function find_face_nodes(elem, r, s, tol=50*eps())
    function find_face_nodes(elem, r, s, t, tol=50*eps())

Given volume nodes `r`, `s`, `t`, finds face nodes. Note that this function implicitly 
defines an ordering on the faces. 
"""
function find_face_nodes(elem::Tri, r, s, tol=50*eps())
    e1 = findall(@. abs(s + 1) < tol)
    e2 = findall(@. abs(r + s) < tol)
    e3 = findall(@. abs(r + 1) < tol)
    return e1, reverse(e2), reverse(e3)
end

function find_face_nodes(elem::Quad, r, s, tol=50*eps())
    e1 = findall(@. abs(r + 1) < tol)
    e2 = findall(@. abs(r - 1) < tol)
    e3 = findall(@. abs(s + 1) < tol)
    e4 = findall(@. abs(s - 1) < tol)
    return e1, e2, e3, e4
end

function find_face_nodes(elem::Hex, r, s, t, tol=50*eps())
    fv1 = findall(@. abs(r + 1) < tol)
    fv2 = findall(@. abs(r - 1) < tol)
    fv3 = findall(@. abs(s + 1) < tol)
    fv4 = findall(@. abs(s - 1) < tol)
    fv5 = findall(@. abs(t + 1) < tol)
    fv6 = findall(@. abs(t - 1) < tol)
    return fv1, fv2, fv3, fv4, fv5, fv6
end

function find_face_nodes(elem::Tet, r, s, t, tol=50*eps())
    fv1 = findall(@. abs(s +1) < tol)
    fv2 = findall(@. abs(r + s + t + 1) < tol)
    fv3 = findall(@. abs(r + 1) < tol)
    fv4 = findall(@. abs(t + 1) < tol)
    return fv1, fv2, fv3, fv4
end

# face vertices = face nodes of degree 1
face_vertices(elem::Line) = 1, 2
face_vertices(elem) = find_face_nodes(elem, nodes(elem, 1)...)

#####
##### face data for diff elements
#####

function map_face_nodes(elem::Tri, face_nodes)
    r1D = face_nodes
    e = ones(size(r1D)) # vector of all ones
    rf = [r1D; -r1D; -e];
    sf = [-e; r1D; -r1D];
    return rf, sf
end

function map_face_nodes(elem::Quad, face_nodes)
    r1D = face_nodes
    e = ones(size(r1D))
    rf = [-e; e; r1D; r1D]
    sf = [r1D; r1D; -e; e]
    return rf, sf
end

function map_face_nodes(elem::Hex, face_nodes...)
    r, s = face_nodes
    e = ones(size(r))
    rf = [-e; e; r; r; r; r]
    sf = [r; r; -e; e; s; s]
    tf = [s; s; s; s; -e; e]
    return rf, sf, tf
end

function map_face_nodes(elem::Tet, face_nodes...)
    r, s = face_nodes
    e = ones(size(r))
    rf = [r; r; -e; r]
    sf = [-e; s; r; s]
    tf = [s; -(e + r + s); s; -e]
    return rf, sf, tf
end


"""
    function reorder_face_nodes_tensor_product(elem::Quad, N, x_face)

Reorders an input vector `x_face` so that it is more amenable to tensor product operations on 
quadrilateral or hexahedral elements. Assumes that the face nodes are ordered face-by-face, where 
the faces are ordered via 
    
    `x_1 = -1, x_1 = 1, x_2 = -1, x_2 = 1` (quadrilateral) 
    `x_1 = -1, x_1 = 1, x_2 = -1, x_2 = 1, x_3 = -1, x_3 = 1` (hexahedron)
"""
function reorder_face_nodes_face_to_tensor_product(elem::Quad, x_face)
    Nfaces = 4
    num_pts_per_face = length(x_face) ÷ Nfaces

    # reorder face nodes to fit a tensor product structure better
    x_face = reshape(x_face, num_pts_per_face, Nfaces)

    # collect nodes corresponding to vertical faces (`r = ±1`)
    x_face_1 = vcat((x_face[i, 1:2] for i = 1:num_pts_per_face)...)

    # collect nodes corresponding to horizontal faces (`s = ±1`)
    x_face_2 = vcat((x_face[i, 3:4] for i = 1:num_pts_per_face)...)

    return vec(vcat(x_face_1, x_face_2))
end

function reorder_face_nodes_face_to_tensor_product(elem::Hex, x_face)
    Nfaces = 6
    num_pts_per_face = length(x_face) ÷ Nfaces

    # reorder face nodes to fit a tensor product structure better
    x_face = reshape(x_face, num_pts_per_face, Nfaces)

    # collect nodes corresponding to faces (`r = ±1`)
    x_face_1 = vcat((x_face[i, 1:2] for i = 1:num_pts_per_face)...)

    # collect nodes corresponding to horizontal faces (`s = ±1`)
    x_face_2 = vcat((x_face[i, 3:4] for i = 1:num_pts_per_face)...)

    # collect nodes corresponding to horizontal faces (`t = ±1`)
    x_face_3 = vcat((x_face[i, 5:6] for i = 1:num_pts_per_face)...)

    return vec(vcat(x_face_1, x_face_2, x_face_3))
end

"""
    function reorder_face_nodes_tensor_product_to_face(elem::Quad, N, x_face)

Inverse of `reorder_face_nodes_face_to_tensor_product`. 
"""
function reorder_face_nodes_tensor_product_to_face(elem::Quad, x_face)
    Nfaces = 4
    num_pts_per_face = length(x_face) ÷ Nfaces

    # reorder face nodes to fit a tensor product structure better
    x_reordered = zeros(eltype(x_face), num_pts_per_face, Nfaces)
    x_reordered[:, 1] .= view(x_face, 1 : 2 : 2 * num_pts_per_face)
    x_reordered[:, 2] .= view(x_face, 2 : 2 : 2 * num_pts_per_face)
    x_reordered[:, 3] .= view(x_face, 2 * num_pts_per_face + 1 : 2 : 4 * num_pts_per_face)
    x_reordered[:, 4] .= view(x_face, 2 * num_pts_per_face + 2 : 2 : 4 * num_pts_per_face)

    return vec(x_reordered)
end

function reorder_face_nodes_tensor_product_to_face(elem::Hex, x_face)
    Nfaces = 6
    num_pts_per_face = length(x_face) ÷ Nfaces

    # reorder face nodes to fit a tensor product structure better
    x_reordered = zeros(eltype(x_face), num_pts_per_face, Nfaces)
    x_reordered[:, 1] .= view(x_face, 1 : 2 : 2 * num_pts_per_face)
    x_reordered[:, 2] .= view(x_face, 2 : 2 : 2 * num_pts_per_face)
    x_reordered[:, 3] .= view(x_face, 2 * num_pts_per_face + 1 : 2 : 4 * num_pts_per_face)
    x_reordered[:, 4] .= view(x_face, 2 * num_pts_per_face + 2 : 2 : 4 * num_pts_per_face)
    x_reordered[:, 5] .= view(x_face, 4 * num_pts_per_face + 1 : 2 : 6 * num_pts_per_face)
    x_reordered[:, 6] .= view(x_face, 4 * num_pts_per_face + 2 : 2 : 6 * num_pts_per_face)

    return vec(x_reordered)
end

"""
    function inverse_trace_constant(rd::RefElemData)

Returns the degree-dependent constant in the inverse trace equality over the reference element (as 
reported in ["GPU-accelerated dG methods on hybrid meshes"](https://doi.org/10.1016/j.jcp.2016.04.003)
by Chan, Wang, Modave, Remacle, Warburton 2016). 

Can be used to estimate dependence of maximum stable timestep on degree of approximation. 
"""
inverse_trace_constant(rd::RefElemData{1}) = (rd.N+1) * (rd.N+2) / 2
inverse_trace_constant(rd::RefElemData{2, Quad}) = (rd.N+1) * (rd.N + 2)
inverse_trace_constant(rd::RefElemData{3, Hex}) = 3 * (rd.N + 1) * (rd.N + 2) / 2
inverse_trace_constant(rd::RefElemData{1, Line, SBP{TensorProductLobatto}}) = rd.N * (rd.N + 1) / 2 
inverse_trace_constant(rd::RefElemData{2, Quad, SBP{TensorProductLobatto}}) = rd.N * (rd.N + 1) 
inverse_trace_constant(rd::RefElemData{3, Hex, SBP{TensorProductLobatto}}) = 3 * rd.N * (rd.N + 1) / 2 

# precomputed 
_inverse_trace_constants(rd::RefElemData{2, Tri, Polynomial}) = (6.0, 10.898979485566365, 16.292060161853993, 23.999999999999808, 31.884512140579055, 42.42373503225737, 52.88579066878113, 66.25284319164409, 79.3535377715693, 95.53911875636945)
_inverse_trace_constants(rd::RefElemData{3, Tet, Polynomial}) = (10., 16.892024376045097, 23.58210016200093, 33.828424659883034, 43.40423356477473, 56.98869932201791, 69.68035962892684)
inverse_trace_constant(rd::RefElemData{2, Tri, Polynomial}) where {Dim} = _inverse_trace_constants(rd)[rd.N]
inverse_trace_constant(rd::RefElemData{3, Tet, Polynomial}) where {Dim} = _inverse_trace_constants(rd)[rd.N]

# generic fallback
function inverse_trace_constant(rd::RefElemData)
    return maximum(eigvals(Matrix(rd.Vf' * diagm(rd.wf) * rd.Vf), Matrix(rd.Vq' * diagm(rd.wq) * rd.Vq)))
end
